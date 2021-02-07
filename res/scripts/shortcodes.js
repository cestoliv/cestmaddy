const fs = require("fs")
const path = require("path")
const path_resolve = require("path").resolve
const { htmlToText } = require('html-to-text')

const config = require("./config")
const compiler = require("./compiler")
const blogs = require("./blogs") 
const podcasts = require("./podcasts") 
const functions = require("./functions")

/*
    SHORTCODES
*/

exports.get_shortcodes = (str) => {
    var results = {
        replace: [
            /*
                {
                    is_get: true, // is_get => replace with values, else => define values (and erase)
                    shortcode: '[TITLE]',
                    index: 52
                }
            */
        ],
        values: {
            /*
                '[TITLE]': "Good Title"
            */
        }
    }

    // Shortcodes of value to define
    let shortcodes_to_define = [
        // GENERAL
        'TITLE', 
        'DESCRIPTION',

        // BLOG
        'AUTHOR',
        'ENCLOSURE',
        'DATE',
        'LIST_BLOG_RECUR',

        // PODCAST
        'PODCAST_AUDIO',
        'PODCAST_IMAGE',
        'LIST_PODCAST_RECUR'
    ]

    for(short in shortcodes_to_define) {
        let reg = new RegExp(`\\[${shortcodes_to_define[short]}([\\s\\S]*?)\\]`, 'g')
        let found
        do {
            found = reg.exec(str)
            if(found) {
                if(found[1] == undefined || found[1] == '') { // is get
                    results.replace.push({
                        is_get: true,
                        shortcode: found[0],
                        index: found.index
                    })
                }
                else {
                    if(found[1].startsWith("=")) {
                        results.values[`[${shortcodes_to_define[short]}]`] = found[1].substr(1)
                    }

                    results.replace.push({
                        is_get: false,
                        shortcode: found[0],
                        index: found.index
                    })
                }
            }
        } while (found)
    }

    return results
}

exports.replace_shortcode = (str, source_path, type) => {
    shortcode_data = this.get_shortcodes(str)

    for(short_ctr in shortcode_data.replace) {
        let key = shortcode_data.replace[short_ctr].shortcode.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') // [ => \[

        if(!shortcode_data.replace[short_ctr].is_get) {
            str = str.replace(new RegExp(key, "g"), "")
        }
        else {
            let replaced = false

            if(type == "blog") {
                switch (shortcode_data.replace[short_ctr].shortcode) {
                    case "[LIST_BLOG_RECUR]":
                        str = str.replace(
                            new RegExp(key, "g"),
                            this.list_blog_recursively(source_path, str)
                        )
                        replaced = true
                        break
                }
            }
            else if(type == "podcast") {
                switch (shortcode_data.replace[short_ctr].shortcode) {
                    case "[LIST_PODCAST_RECUR]":
                        str = str.replace(
                            new RegExp(key, "g"),
                            this.list_podcast_recursively(source_path, str)
                        )
                        replaced = true
                        break
                }
            }

            if(!replaced && shortcode_data.replace[short_ctr].shortcode == '[DATE]') {
                str = str.replace(new RegExp(key, "g"), functions.date_to_relative_date(
                    shortcode_data.values[shortcode_data.replace[short_ctr].shortcode]
                ))
                replaced = true
            }

            if(!replaced) {
                if(shortcode_data.values.hasOwnProperty(shortcode_data.replace[short_ctr].shortcode)) {
                    str = str.replace(new RegExp(key, "g"), shortcode_data.values[shortcode_data.replace[short_ctr].shortcode])
                }
                else {
                    str = str.replace(new RegExp(key, "g"), "")
                }
            }
        }
    }

    return str
}

/*
    FUNCTIONS
*/



/*
    CONTENT GENERATION
*/

exports.list_blog_recursively = (source_path, file_content) => {
    let list_content = `<ul class="list_blog">`

    let blog_config = blogs.get_blog_config(source_path)
    let posts = compiler.get_every_files_with_extension_of_dir(path.dirname(source_path), "md")

    // get posts_datas
    let posts_data = []
    for(i_post = 0; i_post < posts.length; i_post++) {
        // exclude the current page from the list
        if(path_resolve(source_path) != posts[i_post]) {
            let post_content = ""
            try {
                post_content = fs.readFileSync(posts[i_post], "utf-8")
            }
            catch(err) {
                console.log(`\n${compiler.remove_before_source_from_path(source_path).bold}`)
                console.log(`    ${err}`.red)
                return
            }

            posts_data.push(
                blogs.get_post_data(
                    post_content, 
                    blog_config, 
                    posts[i_post]
                )
            )
        }
    }

    // sort by date
    posts_data = posts_data.sort((a, b) => {
        return a.date_object < b.date_object ? 1 : -1
    })

    for(i_data in posts_data) {
        list_content += `<li>
            <a href="${posts_data[i_data]["link"]}">
                <p class="list_blog_date">${posts_data[i_data]["author"]["name"]}, <strong>${functions.date_to_relative_date(posts_data[i_data]["date"])}</strong> ${posts_data[i_data]["date_object"].toLocaleString(config.get("string", ["content", "language"]))}</p>
                <p class="list_blog_title">${posts_data[i_data]["title"]}</p>
                <p class="list_blog_description">${htmlToText(posts_data[i_data]["description"])}</p>
            </a>
        </li>`
    }

    list_content += "</ul>"

    return list_content
}

exports.list_podcast_recursively = (source_path, file_content) => {
    let list_content = `<ul class="list_podcast">`

    let podcast_config = podcasts.get_podcast_config(source_path)
    let podcasts_list = compiler.get_every_files_with_extension_of_dir(path.dirname(source_path), "md")

    console.log(podcasts_list)

    // get podcasts_data
    let podcasts_data = []
    for(i_pod = 0; i_pod < podcasts_list.length; i_pod++) {
        // exclude the current page from the list
        if(path_resolve(source_path) != podcasts_list[i_pod]) {
            let podcast_content = ""
            try {
                podcast_content = fs.readFileSync(podcasts_list[i_pod], "utf-8")
            }
            catch(err) {
                console.log(`\n${compiler.remove_before_source_from_path(source_path).bold}`)
                console.log(`    ${err}`.red)
                return
            }

            podcasts_data.push(
                podcasts.get_podcast_data(
                    podcast_content, 
                    podcast_config, 
                    podcasts_list[i_pod]
                )
            )
        }
    }

    // sort by date
    podcasts_data = podcasts_data.sort((a, b) => {
        return a.date_object < b.date_object ? 1 : -1
    })

    for(i_data in podcasts_data) {
        list_content += `<li>
            <a href="${podcasts_data[i_data]["link"]}">
                <p class="list_podcast_date">${podcasts_data[i_data]["author"]["name"]}, <strong>${functions.date_to_relative_date(podcasts_data[i_data]["date"])}</strong> ${podcasts_data[i_data]["date_object"].toLocaleString(config.get("string", ["content", "language"]))}</p>
                <div class="list_podcast_tidur_box">
                    <p class="list_podcast_duration">${podcasts.remove_0_before_duration(podcasts_data[i_data]["duration"])}</p>
                    <p class="list_podcast_title">${podcasts_data[i_data]["title"]}</p>
                </div>
                <p class="list_podcast_description">${htmlToText(podcasts_data[i_data]["description"])}</p>
            </a>
        </li>`
    }

    list_content += "</ul>"

    return list_content
}