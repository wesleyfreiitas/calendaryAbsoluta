const express = require("express");
const app = express();
const fetch = require('node-fetch');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const appointmentService = require("./services/AppointmentService");
const AppointmentService = require("./services/AppointmentService");
var mailer = require("nodemailer");

// Static
app.use(express.static(__dirname + '/public'));
app.use("/favicon.ico", express.static("images/favicon.ico"))

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

mongoose.connect("mongodb://127.0.0.1:27017/agendamento", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.set('useFindAndModify', false);

app.get("/", (req, res) => {
    res.render("index");
});
app.post("/getAvailableTimes", async (req, res) => {
    const selectedDate = req.body.selectedDate;
    const owner = req.body.owner;

    // Adicione lógica para consultar os horários disponíveis para o owner na data selecionada
    const availableTimes = await AppointmentService.getAvailableTimes(selectedDate, owner);

    res.json(availableTimes);
});

app.post("/create", async (req, res) => {
    var {
        name,
        email,
        date,
        time
    } = req.body;
    
    var webhook_n8n = `https://uppon-prod.absolutatecnologia.com.br/webhook/07959500-21fb-44d6-9b86-4b06c2f0722b?nome=${name}&email=${email}&date=${date}&time=${time}`
    
    const response = await fetch(webhook_n8n);
    
    const data = await response.json();

    var {link} = data;

    var status = await appointmentService.Create(
        req.body.orner,
        req.body.name,
        req.body.email,
        req.body.date,
        req.body.time,
        link
    )
    if (status) {

        var transporter = mailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "wesleydefreiitas01@gmail.com",
                pass: "otqz hwom clbl exsb"
            }
        });
        transporter.sendMail({
            from: "Wesley Freitas <wesleydefreiitas01@gmail.com>",
            to: req.body.email,
            subject: "Agendamento de reunião",
            text: `Reunião agendada para ${req.body.date} às ${req.body.time} Pode acessar usando o link a seguir: ${link}`
        }).then(message => {

            res.redirect("/");
        }).catch(err => {
            console.log(err)
        })
    } else {
        res.send("Ocorreu uma falha!");
    }
});


app.get("/getcalendar", async (req, res) => {
    var appointments = await AppointmentService.GetAll(false);
    res.json(appointments);
});

app.get("/event/:id", async (req, res) => {
    var appointment = await AppointmentService.GetById(req.params.id);
    console.log(appointment);
    res.render("event", {
        appo: appointment
    });
})

app.post("/finish", async (req, res) => {
    var id = req.body.id;
    var result = await AppointmentService.Finish(id);
    res.redirect("/");
});

app.get("/list", async (req, res) => {

    //await AppointmentService.Search("343.434.343-43");

    var appos = await AppointmentService.GetAll(true);
    res.render("list", {
        appos
    });
});

app.get("/searchresult", async (req, res) => {
    var appos = await AppointmentService.Search(req.query.search)
    res.render("list", {
        appos
    });
})


var pollTime = 1000 * 60 * 5;

setInterval(async () => {

    await AppointmentService.SendNotification();

}, pollTime)



app.listen(8080, () => {});