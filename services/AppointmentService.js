var appointment = require("../models/Appointment");
var mongoose = require("mongoose");
var AppointmentFactory = require("../factories/AppointmentFactory");
var mailer = require("nodemailer");

const Appo = mongoose.model("Appointment", appointment);

class AppointmentService {
    async getAvailableTimes(selectedDate, owner) {
        // Adicione lógica para consultar no banco de dados os horários disponíveis
        // para o owner na data selecionada
        // Exemplo: Consultar todos os horários não ocupados para o owner na data selecionada
        const occupiedTimes = await Appo.find({
            orner: owner,
            date: new Date(selectedDate),
            finished: false
        }).select('time');
    
        // Array de todos os horários possíveis com intervalo de 30 minutos
        const allTimes = Array.from({ length: 18 }, (_, i) => {
            let hour, minute;
    
            if (i < 12) {
                // Manhã: 8:00 - 11:30
                hour = Math.floor(i / 2) + 8;
                minute = i % 2 === 0 ? '00' : '30';
            } else {
                // Tarde: 13:00 - 17:30
                hour = Math.floor((i - 9) / 2) + 13;
                minute = (i - 9) % 2 === 0 ? '00' : '30';
            }
    
            return `${String(hour).padStart(2, '0')}:${minute}`;
        });
    
        // Use um conjunto (Set) para garantir a unicidade dos horários
        const uniqueTimes = new Set(allTimes);
    
        // Se houver horários ocupados, remova esses horários do conjunto
        occupiedTimes.forEach(occupied => {
            uniqueTimes.delete(occupied.time);
        });
    
        // Converta o conjunto de volta para um array
        const horarios = Array.from(uniqueTimes);
    
        console.log(horarios);
        return horarios;
    }
    

    async Create(orner, name, email, date, time, link) {
        console.log(date)
        var newAppo = new Appo({
            orner,
            name,
            email,
            date,
            time,
            link,
            finished: false,
            notified: false
        });
        try {
            await newAppo.save();
            return true
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async GetAll(showFinished) {
        if (showFinished) {
            return await Appo.find();
        } else {
            var appos = await Appo.find({
                'finished': false
            });
            var appointments = [];

            appos.forEach(appointment => {
                if (appointment.date != undefined) {
                    appointments.push(AppointmentFactory.Build(appointment))
                }
            });

            return appointments;
        }
    }

    async GetById(id) {
        try {
            var event = await Appo.findOne({
                '_id': id
            });
            return event;
        } catch (err) {
            console.log(err);
        }
    }

    async Finish(id) {
        try {
            await Appo.findByIdAndUpdate(id, {
                finished: true
            });
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async Search(query) {
        try {
            var appos = await Appo.find().or([{
                email: query
            }, {
                cpf: query
            }])
            return appos;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    async SendNotification() {
        var appos = await this.GetAll(false);

        var transporter = mailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "wesleydefreiitas01@gmail.com",
                pass: "otqz hwom clbl exsb"
            }
        });

        appos.forEach(async app => {

            var date = app.start.getTime();
            var hour = 1000 * 60 * 60;
            var gap = date - Date.now();

            if (gap <= hour) {

                if (!app.notified) {

                    await Appo.findByIdAndUpdate(app.id, {
                        notified: true
                    });

                    transporter.sendMail({
                        from: "",
                        to: app.email,
                        subject: "Nossa reunião vai acontecer em breve!",
                        text: "Prepare-se vamos nos reunir logo logo, em 1h"
                    }).then(() => {

                    }).catch(err => {

                    })

                }
            }

        })
    }

}

module.exports = new AppointmentService();