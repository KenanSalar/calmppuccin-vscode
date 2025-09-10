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
[](fg:red)\
$os\
[](fg:red bg:maroon)\
$username\
[](fg:maroon bg:flamingo)\
$hostname\
[](fg:flamingo bg:peach)\
$directory\
[](fg:peach bg:yellow)\
$git_branch\
$git_status\
[](fg:yellow bg:green)\
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
[](fg:green bg:sapphire)\
$aws\
$azure\
[](fg:sapphire bg:blue)\
$docker_context\
[](fg:blue bg:lavender)\
$time\
[](fg:lavender)\
$cmd_duration\
$line_break\
$character"""

palette = 'catppuccin_mocha'

[os]
disabled = false
style = "bg:red fg:crust"
format = "[$symbol ]($style)"

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
style_user = "bg:maroon fg:crust"
style_root = "bg:maroon fg:crust"
format = "[ $user ]($style)"

[hostname]
ssh_only = false
ssh_symbol = "🌐@"
disabled = false
style = "fg:crust bg:flamingo"
format = "[ $ssh_symbol$hostname ]($style)"

[directory]
style = "bg:peach fg:crust"
format = "[ $path ]($style)"
truncation_length = 3
truncate_to_repo = true
truncation_symbol = "…/"

[directory.substitutions]
"Documents" = "󰈙 "
"Downloads" = " "
"Music" = "󰝚 "
"Pictures" = " "
"Developer" = "󰆍 "
"Development" = "󰆍 "

[git_branch]
symbol = ""
style = "fg:crust bg:yellow"
format = "[[ $symbol $branch ]($style)]($style)"

[git_status]
style = "fg:crust bg:yellow"
format = "[[($all_status$ahead_behind )]($style)]($style)"

[package]
disabled = false
symbol = "❐ "
style = "bg:green fg:crust"
format = "[ $symbol$version ]($style)"

[bun]
symbol = "🥟"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[cmake]
symbol = "△"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[conda]
symbol = ""
style = "fg:crust bg:green"
format = "[ $symbol$environment ]($style)"
ignore_base = false

[deno]
symbol = "🦕"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[gradle]
symbol = "🅶"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[pixi]
symbol = "🧚"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[c]
symbol = ""
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[cpp]
symbol = "C++"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[crystal]
symbol = "🔮"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[daml]
symbol = "Λ"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[dart]
symbol = "🎯"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[dotnet]
symbol = ".NET"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[elixir]
symbol = "💧"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[elm]
symbol = "🌳"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[erlang]
symbol = ""
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[fennel]
symbol = "🧅"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[gleam]
symbol = "⭐"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[golang]
symbol = ""
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[haskell]
symbol = ""
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[haxe]
symbol = "⌘"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[java]
symbol = ""
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[julia]
symbol = "ஃ"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[kotlin]
symbol = ""
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[lua]
symbol = "☽"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[mojo]
symbol = "🔥"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[nim]
symbol = "👑"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[nodejs]
symbol = ""
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[ocaml]
symbol = "🐫"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[perl]
symbol = "🧅"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[php]
symbol = ""
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[purescript]
symbol = ""
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[python]
symbol = ""
style = "bg:green"
format = "[[ $symbol( $version)(\\(#$virtualenv\\)) ](fg:crust bg:green)]($style)"

[rlang]
symbol = "📐"
style = "bg:green"
format = "[[ $symbol( $version)(\\(#$virtualenv\\)) ](fg:crust bg:green)]($style)"

[raku]
symbol = "🦋"
style = "bg:green"
format = "[[ $symbol( $version)(\\(#$virtualenv\\)) ](fg:crust bg:green)]($style)"

[red]
symbol = "🔺"
style = "bg:green"
format = "[[ $symbol( $version)(\\(#$virtualenv\\)) ](fg:crust bg:green)]($style)"

[ruby]
symbol = "💎"
style = "bg:green"
format = "[[ $symbol( $version)(\\(#$virtualenv\\)) ](fg:crust bg:green)]($style)"

[rust]
symbol = ""
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[scala]
symbol = "🆂"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[solidity]
symbol = "S"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[swift]
symbol = "🐦"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[vlang]
symbol = "V"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[zig]
symbol = "↯"
style = "bg:green"
format = "[[ $symbol( $version) ](fg:crust bg:green)]($style)"

[aws]
symbol = "🅰"
style = "fg:crust bg:sapphire"
format = ' on [$symbol( $profile )(\($region\) )]($style)'

[azure]
disabled = false
symbol = "󰠅"
style = "fg:crust bg:sapphire"
format = " on [$symbol( $username )( $subscription )]($style) "

[gcloud]
symbol = '️🇬️'
style = "fg:crust bg:sapphire"
format = 'on [$symbol $account(@$domain)(\($project\))]($style) '

[docker_context]
symbol = ""
style = "bg:blue"
format = "[[ $symbol( $context) ](fg:crust bg:blue)]($style)"

[time]
disabled = false
time_format = "%R"
style = "fg:crust bg:lavender"
format = "[[  $time]($style)]($style)"

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
success_symbol = '[❯](bold fg:green)'
error_symbol = '[!❯](bold fg:red)'
vimcmd_symbol = '[❮](bold fg:green)'
vimcmd_replace_one_symbol = '[❮](bold fg:lavender)'
vimcmd_replace_symbol = '[❮](bold fg:lavender)'
vimcmd_visual_symbol = '[❮](bold fg:yellow)'

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
teal = "#bd5ca"
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
