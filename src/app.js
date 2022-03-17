var express = require('express');
var server = express();
var bodyParser = require('body-parser');

var model = {
  clients: {},
  reset: () => {
    model.clients = {};
  },
  addAppointment: (name, date) => {
    if (!model.clients[name]) {
      return (model.clients[name] = [{ ...date, status: 'pending' }]);
    }
    model.clients[name].push({ ...date, status: 'pending' });
  },
  attend: function (client, date) {
    const appointment = model.clients[client].find((cita) => cita.date === date);
    appointment.status = 'attended';
    return appointment;
  },
  expire: function (client, date) {
    const appointment = model.clients[client].find((cita) => cita.date === date);
    appointment.status = 'expired';
    return appointment;
  },
  cancel: function (client, date) {
    const appointment = model.clients[client].find((cita) => cita.date === date);
    appointment.status = 'cancelled';
    return appointment;
  },
  erase: function (client, arg2) {
    if (arg2 === 'pending' || arg2 === 'attended' || arg2 === 'expired' || arg2 === 'cancelled') {
      const erasedItems = model.clients[client].filter((cita) => cita.status === arg2)
      model.clients[client] = model.clients[client].filter((cita) => cita.status !== arg2);
      return erasedItems
    } else {
      const erasedItems = model.clients[client].filter((cita) => cita.date === arg2);
      model.clients[client] = model.clients[client].filter((cita) => cita.date !== arg2);
      return erasedItems
    }
  },
  getAppointments: function (client, status) {
    if (status) {
      return model.clients[client].filter((cita) => cita.status == status);
    }
    return model.clients[client];
  },
  getClients: function () {
    let clientes = [];
    for (let name in model.clients) {
      clientes.push(name);
    }
    return clientes;
  },
};

server.use(bodyParser.json());

server.get('/api', (req, res) => {
  return res.json(model.clients);
});

server.get('/api/Appointments/clients', (req, res) => {
    return res.send(model.getClients());
})

server.post('/api/Appointments', (req, res) => {
  if (!req.body.client) {
    return res.status(400).send('the body must have a client property');
  }
  if (typeof req.body.client !== 'string') {
    return res.status(400).send('client must be a string');
  } else {
    model.addAppointment(req.body.client, req.body.appointment);
  }
  return res.status(200).send({ ...req.body.appointment, status: 'pending' });
});

server.get('/api/Appointments/:client', (req, res) => {
  const { client } = req.params;
  const { date, option } = req.query;
  console.log(date);
  if (!model.clients[client]) {
    return res.status(400).send('the client does not exist');
  }
  if (!model.clients[client].find((cita) => cita.date === date)) {
    return res.status(400).send('the client does not have a appointment for that date');
  }
  if (option !== 'attend' && option !== 'expire' && option !== 'cancel') {
    return res.status(400).send('the option must be attend, expire or cancel');
  }
  if (option === 'attend') {
    return res.send(model.attend(client, date));
  }
  if (option === 'expire') {
    return res.send(model.expire(client, date));
  }
  if (option === 'cancel') {
    return res.send(model.cancel(client, date));
  }
  return res.send('Hola');
});

server.get('/api/Appointments/:name/erase', (req, res) => {
  const { name } = req.params;
  const { date } = req.query

  if (!model.clients[name]) {
    return res.status(400).send('the client does not exist');
  }

  if(date) return res.send(model.erase(name, date))

  return res.send('Hola');
});

server.get('/api/Appointments/getAppointments/:name', (req, res) => {
    const { name } = req.params
    const { status } = req.query 

    return res.send(model.getAppointments(name, status))
})


server.listen(3001, () => {
  console.log('Listening on port 3000');
});
module.exports = { model, server };
