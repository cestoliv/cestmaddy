// Importing external modules
const path = require("path")
const path_resolve = require("path").resolve
const fs = require("fs")
const ejs = require("ejs")
// Importing local modules
const config = require("./config")
const compiler = require("./compiler")
const shortcodes = require("./shortcodes")
const markdown_compiler = require("./markdown_compiler")
const functions = require("./functions")

exports.compile = (source_path, additional_data={}) => {
    /*
        Main function, call the function to compile post,
        copy the others files and return the post data

        Takes the source_path of the file
        Takes an optional additional_data object with a blogs_list and a podcasts_list
    */

    // if it's not a page but an image or any other file
    if(!compiler.is_markdown_file(source_path)) {
        // create the destination path
        let without_source = compiler.remove_source_from_path(source_path)
        let copy_dest = `${path.join("res", "content", "generated", without_source)}`
        compiler.copy_file(source_path, `${copy_dest}`)
    }
    else {
        this.compile_html(source_path, additional_data)
    }
}

exports.compile_html = (source_path, additional_data={}) => {
    /*
        Compile the page with it's data and the template (ejs) of the theme

        Takes the source file of the file
        Takes an optional additional_data object with a blogs_list and a podcasts_list
    */

    // get file content
    let source_file = ""
    try {
        source_file = fs.readFileSync(path_resolve(source_path), "utf-8")
    }
    catch(err) {
        console.log(`\n${compiler.remove_before_source_from_path(source_path).bold}`)
        console.log(`    ${err}`.red)
        return
    }

    let page_shortcodes = shortcodes.get_shortcodes(source_file)

    //compile page
    source_file = shortcodes.replace_shortcode(
        source_file,
        source_path,
        additional_data
    )
    let source_html = markdown_compiler.compile(source_file)
    
    // site data
    let site = {
        title: config.get("string", ["content", "title"]),
        header: compiler.get_header_content(),
        footer: compiler.get_footer_content(),
        theme: "clean",
        type: "normal",
        favicon: {
            theme_color: config.get("string", ["content", "favicon", "theme_color"]),
            background: config.get("string", ["content", "favicon", "background"]),
        }
    }
    if(config.get("string", ["content", "theme"]) != "") {
        site.theme = config.get("string", ["content", "theme"])
    }

    ///
    // Get data from shortcodes
    ///
    // normal data
    let normal = {
        title: "",
        meta_description: "",
        html: source_html
    }
    //title
    if(page_shortcodes.values.hasOwnProperty("[TITLE]")) {
        normal.title = page_shortcodes.values["[TITLE]"]
    }
    //description
    if(page_shortcodes.values.hasOwnProperty("[DESCRIPTION]")) {
        normal.meta_description = functions.remove_html_tags(
            markdown_compiler.compile(
               page_shortcodes.values["[DESCRIPTION]"]
            )
        )
    }
    else {
        normal.meta_description = functions.remove_html_tags(
            markdown_compiler.compile(
                shortcodes.remove_shortcode(source_file.substr(0, 500))
            )
        )
    }

    ejs.renderFile(`./res/content/front/themes/${site.theme}/templates/normal.ejs`, {
        site: site,
        normal: normal
    }, (err, str) => {
        if(err) {
            console.log(`\n${compiler.remove_before_source_from_path(source_path).bold}`)
            console.log(`    ${err}`.red)
        }
        else {
            // remove both source/ and .md
            let without_source_and_ext = compiler.remove_source_and_md_extension_from_path(source_path)
            let new_file_source_path = `${path.join("res", "content", "generated", without_source_and_ext)}.html`
            
            fs.mkdir(path.dirname(new_file_source_path), {recursive: true}, (err) => {
                if(err) {
                    console.log(`\n${compiler.remove_before_source_from_path(source_path).bold}`)
                    console.log(`    ${err}`.red)
                }
                else {
                    fs.writeFile(new_file_source_path, str, (err, data) => {
                        if(!err) {
                            compiler.look_for_conflict(source_path, new_file_source_path)
                        }
                        else {
                            console.log(`\n${compiler.remove_before_source_from_path(source_path).bold}`)
                            console.log(`    ${err}`.red)
                        }
                    }) 
                }
            })
        }
    })
}