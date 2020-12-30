const chokidar = require('chokidar')
const marked = require('marked')
const fs = require("fs")
const colors = require('colors')
var mkdirp = require('mkdirp')

const contentDir = "./res/content/generated"

marked.setOptions({
    renderer: new marked.Renderer(),
    /*highlight: function(code, language) {
      const hljs = require('highlight.js');
      const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
      return hljs.highlight(validLanguage, code).value;
    },*/
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false
})

const watcher = chokidar.watch('source', { persistent: true })

compileFile = (path) => {
    // check extension
    let extension = path.match(/(.md)$/)
    if(!extension) {
        let new_file_path = `${contentDir}${path.substr(6, path.length)}`
        let folder = new_file_path.match(/^(.*)\//)[1]
        
        mkdirp(folder).then((made) => {
            fs.copyFile(`./${path}`, new_file_path, (err) => {
                console.log(`\n${path.bold}`)
                if(err) {
                    console.log(`    ${err}`.red)
                }
                else {
                    console.log(`    Successfully copied! (only .md are compiled)`.green)
                }
            })        
        })    
    }
    else {
        fs.readFile(path, "utf8", (err, data) => {
            if(!err) {
                //console.log()
                let html = marked(data)

                // remove both source/ and .md
                let new_file_path = `${contentDir}${path.substr(6, path.length - 9)}.html`

                // without filename
                let folder = new_file_path.match(/^(.*)\//)[1]
                
                mkdirp(folder).then((made) => {
                    fs.writeFile(new_file_path, html, (err,data) => {
                        if(!err) {
                            console.log(`\n${path.bold}`)
                            console.log(`    Successfully compiled!`.green)
                        }
                        else {
                            console.log(`\n${path.bold}`)
                            console.log(`    ${err}`.red)
                        }
                    }) 
                }).catch((err) => {
                    console.log(`\n${path.bold}`)
                    console.log(`    ${err}`.red)
                })
            }
            else {
                console.log(`\n${path.bold}`)
                console.log(`    ${err}`.red)
            }
        })
    }
    
}

fileChange = (path) => {
    compileFile(path)
}

removeFile = (path) => {
    // remove source/
    let old_file_path = `${contentDir}${path.substr(6, path.length)}`

    // check if file hav been compiled
    fs.access(`${old_file_path}`, fs.constants.F_OK, (err) => {
        console.log(`\n${path.bold}`)
        if (!err) {
            fs.unlink(`${old_file_path}`, (err) => {
                if(err) {
                    console.log(`    ${err}`.red)
                }
                else {
                    console.log(`    Successfully deleted!`.green)
                }
            })
        }
        else {
            // try replace .md with .html
            old_file_path = `${old_file_path.substr(0, old_file_path.length - 3)}.html`
            fs.unlink(`${old_file_path}`, (err) => {
                if(err) {
                    console.log(`    ${err}`.red)
                }
                else {
                    console.log(`    Successfully deleted!`.green)
                }
            })
        }
    })
}

// Add event listeners.
watcher
  .on('add', path => fileChange(path))
  .on('change', path => fileChange(path))
  .on('unlink', path => removeFile(path))
  .on('error', error => console.log(`Watcher error: ${error}`.red))