#!/bin/bash
set -e
echo "--- Installing Starship ---"
# Install Starship system-wide if it's not already installed
if ! command -v starship &> /dev/null; then
    sudo curl -sS https://starship.rs/install.sh | sudo sh -s -- -y
    sync
else
    echo "Starship already installed. Skipping."
fi

# Create the starship.toml configuration file for the 'node' user.
mkdir -p /home/node/.config
echo "Creating starship.toml configuration..."
cat <<'EOF' > /home/node/.config/starship.toml
"$schema" = 'https://starship.rs/config-schema.json'

format = """
$username\
$hostname\
$directory\
$git_branch\
$git_status\
$package\
$bun\
$cmake\
$conda\
$deno\
$gradle\
$pixi\
$c\
$cpp\
$crystal\
$daml\
$dart\
$dotnet\
$elixir\
$elm\
$erlang\
$fennel\
$gleam\
$golang\
$haskell\
$haxe\
$java\
$julia\
$kotlin\
$lua\
$mojo\
$nim\
$nodejs\
$ocaml\
$perl\
$php\
$purescript\
$python\
$rlang\
$raku\
$red\
$ruby\
$rust\
$scala\
$solidity\
$swift\
$vlang\
$zig\
$aws\
$azure\
$docker_context\
$time\
$cmd_duration\
$line_break\
$character"""

palette = 'catppuccin_mocha'

[os]
disabled = true
style = "bg:os_bg fg:blue"
format = "[$symbol]($style)"

[os.symbols]
Windows = ""
Ubuntu = "󰕈"
SUSE = ""
Raspbian = "󰐿"
Mint = "󰣭"
Macos = "󰀵"
Manjaro = ""
Linux = "󰌽"
Gentoo = "󰣨"
Fedora = "󰣛"
Alpine = ""
Amazon = ""
Android = ""
Arch = "󰣇"
Artix = "󰣇"
CentOS = ""
Debian = "󰣚"
Redhat = "󱄛"
RedHatEnterprise = "󱄛"

[username]
show_always = true
style_user = "fg:text"
style_root = "fg:text"
format = "[$user]($style)"

[hostname]
ssh_only = false
ssh_symbol = "🌐"
disabled = false
style = "fg:maroon"
format = "[$ssh_symbol@$hostname]($style)"

[directory]
style = "fg:peach"
format = "[ $path]($style)"
truncation_length = 2
truncate_to_repo = true
truncation_symbol = "…/"

[git_branch]
symbol = ""
style = "fg:yellow"
format = "[ $symbol $branch]($style)"

[git_status]
style = "fg:bold yellow"
ahead = '⇡${count}'
behind = '⇣${count}'
diverged = '⇕⇡${ahead_count}⇣${behind_count}'
untracked = '?${count}'
stashed = '$${count}'
modified = '!${count}'
staged = '+${count}'
renamed = '»${count}'
deleted = '✘${count}'
conflicted = '=${count}'
typechanged = ""
format = '([ \[$all_status$ahead_behind\]]($style))'

[package]
disabled = false
symbol = "❐"
style = "fg:green"
format = "[ $symbol $version ]($style)"

[bun]
symbol = "bun"
style = "fg:green"
format = "[$symbol $version]($style)"

[cmake]
symbol = "cmake"
style = "fg:green"
format = "[$symbol $version]($style)"

[conda]
symbol = "conda"
style = "fg:crust bg:green"
format = "[$symbol$environment]($style)"
ignore_base = false

[deno]
symbol = "deno"
style = "fg:green"
format = "[$symbol $version]($style)"

[gradle]
symbol = "gradle"
style = "fg:green"
format = "[$symbol $version]($style)"

[pixi]
symbol = "pixi"
style = "fg:green"
format = "[$symbol $version]($style)"

[c]
symbol = "C"
style = "fg:green"
format = "[$symbol $version]($style)"

[cpp]
symbol = "C++"
style = "fg:green"
format = "[$symbol $version]($style)"

[crystal]
symbol = "crystal"
style = "fg:green"
format = "[$symbol $version]($style)"

[daml]
symbol = "Λ"
style = "fg:green"
format = "[$symbol $version]($style)"

[dart]
symbol = "dart"
style = "fg:green"
format = "[$symbol $version]($style)"

[dotnet]
symbol = ".NET"
style = "fg:green"
format = "[$symbol $version]($style)"

[elixir]
symbol = "elexir"
style = "fg:green"
format = "[$symbol $version]($style)"

[elm]
symbol = "elm"
style = "fg:green"
format = "[$symbol $version]($style)"

[erlang]
symbol = "erlang"
style = "fg:green"
format = "[$symbol $version]($style)"

[fennel]
symbol = "fennel"
style = "fg:green"
format = "[$symbol $version]($style)"

[gleam]
symbol = "gleam"
style = "fg:green"
format = "[$symbol $version]($style)"

[golang]
symbol = "go"
style = "fg:green"
format = "[$symbol $version]($style)"

[haskell]
symbol = "haskell"
style = "fg:green"
format = "[$symbol $version]($style)"

[haxe]
symbol = "haxe"
style = "fg:green"
format = "[$symbol $version]($style)"

[java]
symbol = "java"
style = "fg:green"
format = "[$symbol $version]($style)"

[julia]
symbol = "julia"
style = "fg:green"
format = "[$symbol $version]($style)"

[kotlin]
symbol = "kotlin"
style = "fg:green"
format = "[$symbol $version]($style)"

[lua]
symbol = "lua"
style = "fg:green"
format = "[$symbol $version]($style)"

[mojo]
symbol = "mojo"
style = "fg:green"
format = "[$symbol $version]($style)"

[nim]
symbol = "nim"
style = "fg:green"
format = "[$symbol $version]($style)"

[nodejs]
symbol = "node"
style = "fg:green"
format = "[$symbol $version]($style)"

[ocaml]
symbol = "ocaml"
style = "fg:green"
format = "[$symbol $version]($style)"

[perl]
symbol = "perl"
style = "fg:green"
format = "[$symbol $version]($style)"

[php]
symbol = "php"
style = "fg:green"
format = "[$symbol $version]($style)"

[purescript]
symbol = "purescript"
style = "fg:green"
format = "[$symbol $version]($style)"

[python]
symbol = "python"
style = "bg:green"
format = "[[$symbol( $version)(\\(#$virtualenv\\))](fg:crust bg:green)]($style)"

[rlang]
symbol = "rlang"
style = "bg:green"
format = "[[$symbol( $version)(\\(#$virtualenv\\))](fg:crust bg:green)]($style)"

[raku]
symbol = "raku"
style = "bg:green"
format = "[[$symbol( $version)(\\(#$virtualenv\\))](fg:crust bg:green)]($style)"

[red]
symbol = "red"
style = "bg:green"
format = "[[$symbol( $version)(\\(#$virtualenv\\))](fg:crust bg:green)]($style)"

[ruby]
symbol = "ruby"
style = "bg:green"
format = "[[$symbol( $version)(\\(#$virtualenv\\))](fg:crust bg:green)]($style)"

[rust]
symbol = "rust"
style = "fg:green"
format = "[$symbol $version]($style)"

[scala]
symbol = "scala"
style = "fg:green"
format = "[$symbol $version]($style)"

[solidity]
symbol = "solidity"
style = "fg:green"
format = "[$symbol $version]($style)"

[swift]
symbol = "swift"
style = "fg:green"
format = "[$symbol $version]($style)"

[vlang]
symbol = "vlang"
style = "fg:green"
format = "[$symbol $version]($style)"

[zig]
symbol = "zig"
style = "fg:green"
format = "[$symbol $version]($style)"

[aws]
symbol = "aws"
style = "fg:sapphire"
format = '[ $symbol( $profile )(\($region\) )]($style)'

[azure]
disabled = false
symbol = "azure"
style = "fg:sapphire"
format = "[ $symbol( $username )( $subscription )]($style) "

[gcloud]
symbol = 'gcloud'
style = "fg:sapphire"
format = ' on [$symbol $account(@$domain)(\($project\))]($style) '

[docker_context]
symbol = ""
style = "fg:blue"
format = "[ $symbol $context]($style)"

[time]
disabled = false
time_format = "%R"
style = "fg:lavender"
format = "[  $time]($style)"

[cmd_duration]
show_milliseconds = true
disabled = false
show_notifications = true
min_time_to_notify = 45000
style = "fg:subtext1"
format = "[  in $duration]($style)"

[line_break]
disabled = false

[character]
disabled = false
success_symbol = '[❯](fg:subtext0)'
error_symbol = '[!❯](fg:red)'
vimcmd_symbol = '[❮](fg:subtext0)'
vimcmd_replace_one_symbol = '[❮](fg:lavender)'
vimcmd_replace_symbol = '[❮](fg:lavender)'
vimcmd_visual_symbol = '[❮](fg:yellow)'

[palettes.catppuccin_mocha]
rosewater = "#f5e0dc"
flamingo = "#f2cdcd"
pink = "#f5c2e7"
mauve = "#cba6f7"
red = "#f38ba8"
maroon = "#eba0ac"
peach = "#fab387"
yellow = "#f9e2af"
green = "#a6e3a1"
teal = "#94e2d5"
sky = "#89dceb"
sapphire = "#74c7ec"
blue = "#89b4fa"
lavender = "#b4befe"
text = "#cdd6f4"
subtext1 = "#bac2de"
subtext0 = "#a6adc8"
overlay2 = "#9399b2"
overlay1 = "#7f849c"
overlay0 = "#6c7086"
surface2 = "#585b70"
surface1 = "#45475a"
surface0 = "#313244"
base = "#1e1e2e"
mantle = "#181825"
crust = "#11111b"

[palettes.catppuccin_frappe]
rosewater = "#f2d5cf"
flamingo = "#eebebe"
pink = "#f4b8e4"
mauve = "#ca9ee6"
red = "#e78284"
maroon = "#ea999c"
peach = "#ef9f76"
yellow = "#e5c890"
green = "#a6d189"
teal = "#81c8be"
sky = "#99d1db"
sapphire = "#85c1dc"
blue = "#8caaee"
lavender = "#babbf1"
text = "#c6d0f5"
subtext1 = "#b5bfe2"
subtext0 = "#a5adce"
overlay2 = "#949cbb"
overlay1 = "#838ba7"
overlay0 = "#737994"
surface2 = "#626880"
surface1 = "#51576d"
surface0 = "#414559"
base = "#303446"
mantle = "#292c3c"
crust = "#232634"

[palettes.catppuccin_latte]
rosewater = "#dc8a78"
flamingo = "#dd7878"
pink = "#ea76cb"
mauve = "#8839ef"
red = "#d20f39"
maroon = "#e64553"
peach = "#fe640b"
yellow = "#df8e1d"
green = "#40a02b"
teal = "#179299"
sky = "#04a5e5"
sapphire = "#209fb5"
blue = "#1e66f5"
lavender = "#7287fd"
text = "#4c4f69"
subtext1 = "#5c5f77"
subtext0 = "#6c6f85"
overlay2 = "#7c7f93"
overlay1 = "#8c8fa1"
overlay0 = "#9ca0b0"
surface2 = "#acb0be"
surface1 = "#bcc0cc"
surface0 = "#ccd0da"
base = "#eff1f5"
mantle = "#e6e9ef"
crust = "#dce0e8"

[palettes.catppuccin_macchiato]
rosewater = "#f4dbd6"
flamingo = "#f0c6c6"
pink = "#f5bde6"
mauve = "#c6a0f6"
red = "#ed8796"
maroon = "#ee99a0"
peach = "#f5a97f"
yellow = "#eed49f"
green = "#a6da95"
teal = "#8bd5ca"
sky = "#91d7e3"
sapphire = "#7dc4e4"
blue = "#8aadf4"
lavender = "#b7bdf8"
text = "#cad3f5"
subtext1 = "#b8c0e0"
subtext0 = "#a5adcb"
overlay2 = "#939ab7"
overlay1 = "#8087a2"
overlay0 = "#6e738d"
surface2 = "#5b6078"
surface1 = "#494d64"
surface0 = "#363a4f"
base = "#24273a"
mantle = "#1e2030"
crust = "#181926"
EOF

# Give ownership of the config files to the node user
sudo chown -R node:node /home/node/.config

echo "Starship setup complete."
