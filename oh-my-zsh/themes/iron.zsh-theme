#%{$fg_bold[green]%}%n@%m %{$reset_color%}

PROMPT=$'%{$fg[green]%}%D{{%X}} %{$fg[white]%}[%~]%{$reset_color%} $(git_prompt_info) %{$fg_bold[red]%}→%{$reset_color%} '

ZSH_THEME_GIT_PROMPT_PREFIX="%{$fg[green]%}["
ZSH_THEME_GIT_PROMPT_SUFFIX="]%{$reset_color%}"
ZSH_THEME_GIT_PROMPT_DIRTY=" %{$fg[red]%}*%{$fg[green]%}"
ZSH_THEME_GIT_PROMPT_CLEAN=""
