{ pkgs, ... }: {
  channel = "stable-23.11";
  packages = [ pkgs.nodejs_20 ];
  idx = {
    previews = [
      {
        command = "npm run dev";
        port = 5173;
        label = "Web App";
      }
    ];
  };
}