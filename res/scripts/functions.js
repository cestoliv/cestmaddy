exports.user_date_to_date_object = (u_date = "") => {
    /*
        Convert a date string ("YYYY-MM-DDTHH:MM:SS")
        to a date object

        Takes the date string

        Returns a date object
    */
    let date_parsed = Date.parse(u_date)
    if(u_date == "") {
        date_parsed = Date.now()
    }
    let date = new Date()
    date.setTime(date_parsed)

    return date
}

exports.date_to_relative_date = (u_date) => {
    /*
        Convert a date to a relative date

        Takes a date

        Return a relative date string or "Invalid Date"
    */
    u_date = new Date(u_date)
    let formatter = new Intl.RelativeTimeFormat({
        localeMatcher: "best fit",
        numeric: "always",
        style: "long",
    })

    let divisions = [
        { amount: 60, name: 'seconds' },
        { amount: 60, name: 'minutes' },
        { amount: 24, name: 'hours' },
        { amount: 7, name: 'days' },
        { amount: 4.34524, name: 'weeks' },
        { amount: 12, name: 'months' },
        { amount: Number.POSITIVE_INFINITY, name: 'years' }
    ]
      
    let duration = (u_date - new Date()) / 1000
        
    for (i = 0; i <= divisions.length-1; i++) {
        let division = divisions[i]
        if (Math.abs(duration) < division.amount) {
            return `${formatter.format(Math.round(duration), division.name)}`
        }
        duration /= division.amount
    }

    return "Invalid Date"
}

exports.remove_html_tags = (html) => {
    /*
        Remove the html tags of a string and return it with regex
    */
    text = html.toString()
    text = text.replace( /(<([^>]+)>)/ig, '')
    return text
}