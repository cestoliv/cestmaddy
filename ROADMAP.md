# Roadmap

Current version : **v0.1.1**

- **v0.1.2** :
    + [X] ~~*Make the generation 2x faster (do not recompile each file)*~~ [2021-05-13]
    + [X] ~~*Update of docker configuration files*~~ [2021-05-14]
    + [X] ~~*Better documentation and commenting of the code*~~ [2021-05-18]
    + [X] ~~*Do not cut the content in the rss feed*~~ [2021-05-14]

- **v0.1.3** :
    + [ ] Log cleanup
    + [ ] Display configuration errors in the logs
    + [ ] Use multiple threads during generation

- **v0.1.4** :
    + [ ] Command to import/export (backup) the site, including comments if they are running under docker with the site
    + [ ] Added OpenGraph support
    + [ ] The domain is generated in real time (like the RELATIVE_DATE) to allow different domains, TOR, etc.

- **v0.2.0 : Shortcodes update** :
    + [ ] `LIST_BLOG_RECUR` and `LIST_PODCAST_RECUR` replaced by `LIST` with parameters (recur, type, enclosure) and page list added
    + [ ] Added external shortcodes management (install and update command)
    + [ ] Adding new shortcodes
        * [ ] `[HIDE]` to hide a post or podcast
        + [ ] `[SEARCH_BAR]` adds a site-wide search bar
- **v0.3.0 : Themes update** :
    + [ ] Command to add and update external themes
    + [ ] Possibility to add a custom stylesheet for each type of page (in `custom/themes/custom/*.css`)
- **v1.0.0 : Webmaster update** :
    + [ ] Added an interface to add and modify pages, change the style, add posts and podcasts.