{
  description = "A basic devShell for Clang, Rust using Crane, Fenix, flake-utils.";
  # TODO: Clang
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    crane.url = "github:ipetkov/crane";
    crane.inputs.nixpkgs.follows = "nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
    flake-utils.inputs.nixpkgs.follows = "nixpkgs";
    # flake-utils-plus.url = "github:gytis-ivaskevicius/flake-utils-plus";
    fenix.url = "github:nix-community/fenix";
    fenix.inputs.nixpkgs.follows = "nixpkgs";
    flake-compat.url = "github:edolstra/flake-compat";
    flake-compat.flake = false;
    flake-compat.inputs.nixpkgs.follows = "nixpkgs";
    nix-filter.url = "github:numtide/nix-filter";
    npmlock2nix.url = "github:nix-community/npmlock2nix";
    npmlock2nix.flake = false; 
  };

  outputs = { self, nixpkgs, crane, flake-utils, flake-compat, fenix, ... }@inputs:
    flake-utils.lib.eachDefaultSystem (system:
    # TODO Use flake-utils with flake-utils.lib.eachSystem supportedSystems 
    # What systems have been implemented and supported by this flake?
    # supportedSystems = [
    #    # TODO "aarch64-linux"
    #    # TODO "x86_64-linux"        
    #    "aarch64-darwin"
    #    "x86_64-darwin"
    #    # TODO: Add M1 Support.
    #  ];
    let
      pkgs = import nixpkgs {
        inherit system;
      };
      inherit (pkgs) lib stdenv;

      # Non-Flake input, so need to import it.
      npmlock2nix = pkgs.callPackages inputs.npmlock2nix {};

      # Fix-up the flake introduced name for nix-filter for consistency.
      nix-filter = inputs.nix-filter.lib;

      # Debugging functions. TODO clean these up a bit to be more useful and able
      # to easily switch debugging on/off.
      traceVal = pkgs.lib.debug.traceVal;
      traceSeq = val: pkgs.lib.debug.traceSeqN 4 val val;
      trace = val: pkgs.lib.debug.traceValSeqN 4 val val;
      log_drv = drv: pkgs.lib.debug.traceSeqN 1 "Dervivation Output: ${drv}" drv;

      # Sops/Age encrypted secrets.
      api_tokens_secrets_file = "./secrets/apitokens.dev.json";

      # Use a particular Rust Toolchain
      fenix-toolchain = (fenix.packages.${system}.complete.withComponents [
        "rustc" "cargo"
        "clippy" "rust-src"  "rustfmt"
        "rust-analyzer"
        "llvm-tools-preview"
      ]);
      fenix-channel = fenix.packages.${system}.stable;
      # Use the selected toolchain in Crane.
      craneLib = crane.lib.${system}.overrideToolchain fenix-toolchain;
    
      # Apple specific frameworks and Libraries
      frameworks = pkgs.darwin.apple_sdk.frameworks;

      # Common derivation arguments used for all builds
      commonArgs =  {
        name = "tomo";
        root = ./tools; # BUG nix-filter has a permissions problem when ./. is used.
        # On Darwin, libiconv must be explicity included in the build dependencies.
        buildInputs = with pkgs; lib.optionals stdenv.isDarwin [
          libiconv cocoapods m-cli 
        ];
        nativeBuildInputs = with pkgs; [];
      };

      # Use a standard way of naming derivations package names.
      packageName = suffix: commonArgs.name + "-" + suffix;

      # To get good build times it's vitally important to not have to rebuild 
      # derivation needlessly. The way Nix caches things is very simple: if 
      # any input file changed, derivation needs to be rebuild. Use nix-filter
      # to include or exlude files and directories from a derivation build.
      commonFilters = rec {
        cargoFiles = ["Cargo.lock" "Cargo.toml" (nix-filter.matchName "Cargo")];
        npmFiles = ["package-lock.json" "package.json"];

        rustSources = [(nix-filter.matchExt "rs")];
        testScripts = [(nix-filter.inDirectory "scripts")];

        markdownFiles = [(nix-filter.matchExt "md")];
        # TODO specify the standard directories used by antora.
        asciidocFiles = [(nix-filter.matchExt "adoc")]; 
        readmeFiles = ["README.md" "SECURITY.md" "LICENSE" "CHANGELOG.md" "CODE_OF_CONDUCT.md"];
        nixFiles = [(nix-filter.matchExt "nix")];
        configFiles = [".editorconfig"];    

        workspaceIncludes = cargoFiles;
        projectIncludes = cargoFiles ++ rustSources;
        projectExcludes = markdownFiles ++ asciidocFiles ++ testScripts;
        docsInclude = asciidocFiles;
        docsAntoraInclude = npmFiles;
        docsSourceInclude = docsInclude ++ markdownFiles ++ rustSources;
        # TODO Add more filters for things like CI testing etc.
      };

      # A function to define cargo+nix package, listing all the dependencies (as dir)
      # to help limit the amount of things that need to rebuild when some file change.
      # (original copied from https://github.com/fedimint/fedimint )
      projectBuild = { name ? null, includeDir ? null, excludeDir ? null }: 
        let
          mkFilter = {common, optional? null}: common ++ lib.optionals (builtins.isList optional) optional;
        in rec {
        package = craneLib.buildPackage (commonArgs // {
          cargoArtifacts = workspaceDependencyBuild;
          # TODO Turn off any build checking for the moment.
          doCheck = false;
          # Include only files needed to build a project.
          src = nix-filter {
            root = commonArgs.root;
            include = mkFilter {common = commonFilters.projectIncludes; optional = includeDir;};
            # TODO Make the documentational optional on a documentation and build flag?
            exclude = mkFilter {common = commonFilters.projectExcludes; optional = excludeDir;};
          };          
        } // lib.optionalAttrs (name != null) {
          pname = name;
          cargoExtraArgs = "--bin ${name}";
        });
      };

      # Build a crate and any binary dependencies
      buildCrate = { pname, version, sha256, buildInputs ? commonArgs.buildInputs, bin ? true }: rec {
        package = craneLib.buildPackage {
          inherit pname version buildInputs;
          doCheck = false;
          src = pkgs.fetchCrate {
            inherit pname version sha256;
          }; 
        } // lib.optionalAttrs bin {
          cargoExtraArgs = "--bin ${pname}"; # Extra option to make Cargo build binaries.
        };
      };

      # Build *just* the cargo dependencies, so we can reuse all of that work 
      # Creates a target.tar.zst file which can use tar with the unzstd command
      # to decompress it: '''tar --use-compress-program=unzstd -xvf archive.tar.zst'''
      workspaceDependencyBuild = craneLib.buildDepsOnly (commonArgs // rec {
        pname = "workspace-dependencies";
        name = packageName pname;
        doCheck = false;
        # Include only files needed to build project dependencies which are
        # the essentially the Cargo files. Any *.rs files are not needed to
        # build dependencies because by definition they are independant projects.
        src =  nix-filter {
          root = commonArgs.root;
          include = commonFilters.cargoFiles ++ [commonArgs.name];
        };
      });

    in {  
      # Build the development shell invoked by ''direnv'' or ''nix develop''  
      devShells.default = pkgs.mkShell {
        buildInputs = with pkgs; [
        # buildInputs = with pkgs; commonArgs.buildInputs ++ [
        #  fenix-toolchain
        #  cmake
        #  llvmPackages_16.clang
        #  llvm_16
        #  ninja
        deno
        ];
        # Extra inputs can be added here. On Darwin, libiconv must be explicity 
        # included in the build dependencies this is done by pulling the native
        # inputs from commonsArgs.
        nativeBuildInputs = with pkgs; commonArgs.nativeBuildInputs ++ [

        ];

        RUST_BACKTRACE=1; # Set environment variable for backtracing rust commands.
        RUST_SRC_PATH = "${fenix-channel.rust-src}/lib/rustlib/src/rust/library";
        EDITOR = "code --wait"; # Set primarily for sops.

#        CPLUS_INCLUDE_PATH="${"$(llvm-config --includedir):$CPLUS_INCLUDE_PATH
#        LD_LIBRARY_PATH=$(llvm-config --libdir):$LD_LIBRARY_PATH
#        LDFLAGS="-L/opt/homebrew/opt/llvm/lib"
#        CPPFLAGS="-I/opt/homebrew/opt/llvm/include"


#        CPLUS_INCLUDE_PATH=$(llvm-config --includedir):$CPLUS_INCLUDE_PATH
#        LD_LIBRARY_PATH=$(llvm-config --libdir):$LD_LIBRARY_PATH
#        LDFLAGS="-L/opt/homebrew/opt/llvm/lib"
#        CPPFLAGS="-I/opt/homebrew/opt/llvm/include"

        #shellHook = ''
        #  export NIX_LDFLAGS="-F${frameworks.CoreFoundation}/Library/Frameworks -framework CoreFoundation $NIX_LDFLAGS";
        #  export GIT_CREDENTIALS="$(sops -d --extract '["github_documentation"]' ${api_tokens_secrets_file})";
        #  alias awstest "sops exec-env ./secrets/aws.dev.json aws"
        #'';        
      };
    });
}