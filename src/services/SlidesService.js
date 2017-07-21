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
        return new Promise(function (resolve,reject) {
            fs.writeFile(`res/slides.md`, "" +
                "---\n" +
                "# This is a title slide\n" +
                "##Version " + version.name +"\n"+
                "---\n"+
                "---\n" +
                "![](https://image.ibb.co/cf2S75/bg.png){.background}\n" +
                "# :heart_eyes_cat:                                        Demo Feature Meeting\n" +
                "##<span>Version 7.12                                                          Date 21.07.17                                                        </span>\n" +
                "\n" +
                "---\n" +
                "![](https://image.ibb.co/cFsnqQ/bg.png){.background}\n" +
                "#<span style=\"color:green\">                    Demo Feature Meeting v7.10</span>\n" +
                "<span>                                                                Agenda                         \n" +
                "                                            <b>Development Teams:</b></span> \n" +
                "</span>\n" +
                "\n" +
                "1. LNO: Create option in UI to export all polygons (WMO-57611) by Volodymyr Khoma\n" +
                "2. Feature 2\n" +
                "3. Feature 3\n" +
                "\n" +
                "<b>Project Team:</b>\n" +
                "\n" +
                "<b>Sales, Partner and Marketing News:</b>\n" +
                "\n" +
                "\n" +
                "---\n" +
                "![](https://image.ibb.co/jAbVAQ/devTitle.png){.background}\n" +
                "# <span style=\"color:whitesmoke\"> </span>\n" +
                "\n" +
                "---\n" +
                "![](https://image.ibb.co/cf2S75/bg.png){.background}\n" +
                "# <span style=\"color:whitesmoke\"> </span>                                                    \n" +
                "<span>                                                       </span><span style=\"text-decoration:underline;color:blue\">WMO-57611</span>           \n" +
                "                   <span>                          <b>LNO: Create option in UI to export all polygons</b> </span>                  \n" +
                "                   <span>                                                   by Volodymyr Khoma</span>\n" +
                "\n" +
                "---\n" +
                "\n" +
                "![](https://image.ibb.co/jEeYVQ/project_News.png){.background}\n" +
                "# <span style=\"color:whitesmoke\"> </span>\n" +
                "\n" +
                "---\n" +
                "\n" +
                "![](https://image.ibb.co/dayGjk/sales_News.png){.background}\n" +
                "# <span style=\"color:whitesmoke\"> </span>\n" +
                "\n" +
                "---\n" +
                "\n" +
                "![](https://image.ibb.co/iuLyVQ/latest_Deals.png){.background}"

                , (err)=> {
                    if (err) {
                        console.error('writeFileError'+err);
                        reject(err);
                    }

                    this.createPresentation(resolve,reject);

                });

        });
    }

    createPresentation(resolve,reject){
        exec('md2gslides res/slides.md', (error, stdout, stderr) => {

            if (error) {
                reject(error);
                console.error(`exec error: ${error}`);

            }

            let result = stdout.replace("Opening", "Here is");
            result = result.replace("(", "");
            result = result.replace(")", "");
            console.log(`-------------------------------------------stdout: ${stdout}`);
            console.log(`-------------------------------------------stderr: ${stderr}`);

            resolve(result)
        });

    }

}

module.exports = SlidesService;
