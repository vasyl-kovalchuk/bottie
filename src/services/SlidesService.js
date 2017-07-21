const fs = require('fs');
const {exec} = require('child_process');


const issues = [
    {
        id:57611,
        link:"https://lvserv01.logivations.com/rest/api/latest/issue/57611",
        summary:"LNO: Create option in UI to export all polygons (master issue)",
        developer:"Volodymyr Khoma"
    }

];

class SlidesService {

    constructor(db) {
        this.db = db;
    }

    //version.name , version.releasedDate
    writeSlidesTemplate(version, issues){


        let issueString = "";
        let issueSlides = "";
        let i = 1;
        issues.forEach(issue => {
            issueString += "\n" + i + ". " + issue.summary + " (" + issue.id + ") " + " assignee - " + issue.developer;
            issueSlides += "\n---\n ![](https://image.ibb.co/cf2S75/bg.png){.background}\n #<span style=\"color:whitesmoke\"> </span>                                                    \n<span>                                                       </span><span style=\"text-decoration:underline;color:blue\">WMO-"+issue.id+"</span>                  \n"+
                "<span><b>        "+issue.summary+"</b> </span>                     \n"+
                "<span>                                        assignee: "+issue.developer+"</span>\n             "
            i++;
        });

        return new Promise((resolve, reject)=> {
            fs.writeFile('res/slides.md', "---\n![](https://image.ibb.co/cf2S75/bg.png){.background}\n# :heart_eyes_cat:                                        Demo Feature Meeting\n##<span>Version " + version.name + "                                                          Date " + version.releasedDate + "                                                        </span>" +
                "\n---\n" +
                "![](https://image.ibb.co/cFsnqQ/bg.png){.background}\n" +
                "#<span style=\"color:green\">                    Demo Feature Meeting v." + version.name + "</span>\n" +
                "<span>                                                                Agenda                         \n" +
                "                                            <b>Development Teams:</b></span> \n" +
                "</span>\n" +
                issueString +
                "\n\n<b>Project Team:</b>\n" +
                "\n" +
                "<b>Sales, Partner and Marketing News:</b>\n" +
                "\n---" +
                "\n![](https://image.ibb.co/jAbVAQ/devTitle.png){.background}" +
                "\n# <span style=\"color:whitesmoke\"> </span>" +
                "\n"+issueSlides +
                "\n---\n" +
                "![](https://image.ibb.co/jEeYVQ/project_News.png){.background}\n" +
                "# <span style=\"color:whitesmoke\"> </span>" +
                "\n---\n" +
                "\n![](https://image.ibb.co/dayGjk/sales_News.png){.background}" +
                "\n# <span style=\"color:whitesmoke\"> </span>\n" +
                "\n---\n" +
                "\n![](https://image.ibb.co/iuLyVQ/latest_Deals.png){.background}"


                , (err) => {
                    if (err) {
                        console.error('writeFileError' + err);
                        reject(err);
                    }

                    this.createPresentation(resolve, reject);

                });

        });

    }

    createPresentation(resolve, reject) {
        exec('md2gslides res/slides.md', (error, stdout, stderr) => {

            if (error) {
                reject(error);
                console.error(`exec error: ${error}`);

            }

            let link = stdout.replace("Opening your presentation (", "");
            link = link.replace(")", "");
            console.log(`-------------------------------------------stdout: ${stdout}`);
            console.log(`-------------------------------------------stderr: ${stderr}`);

            resolve(link)
        });

    }



}

module.exports = SlidesService;
