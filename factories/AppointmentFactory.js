class AppointmentFactory{

    Build(simpleAppointment){
// Recebe os dados do service
        var day = simpleAppointment.date.getDate()+1;
        var month = simpleAppointment.date.getMonth();
        var year = simpleAppointment.date.getFullYear();
        var hour =  Number.parseInt(simpleAppointment.time.split(":")[0]);
        var minutes = Number.parseInt(simpleAppointment.time.split(":")[1]);

        var startDate = new Date(year,month,day,hour,minutes,0,0);
        
        var appo = {
            orner:simpleAppointment.orner,
            id: simpleAppointment._id,
            title: simpleAppointment.name,
            // title: simpleAppointment.name + " - " + simpleAppointment.description, 
            start: startDate,
            notified: simpleAppointment.notified,
            email: simpleAppointment.email
        }
        
        return appo;
    }

}

module.exports = new AppointmentFactory();