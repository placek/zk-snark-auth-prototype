{ pkgs ? import <nixpkgs> {} }:
let
  nodejs = pkgs.nodejs;
in
pkgs.mkShell {
  buildInputs = [ nodejs ];
}
