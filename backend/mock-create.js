const EventModel = require('./models/eventModel');
const db = require('./config/db');

async function testCreate() {
  try {
    console.log('Testing event creation in DB...');
    const id = await EventModel.create({
      event_name: 'Teste Evento',
      description: 'Descrição de teste',
      event_date: '2026-05-26',
      event_location: 'Local de Teste'
    });
    console.log('Success! Created event with ID:', id);
  } catch (err) {
    console.error('Error during creation:', err);
  } finally {
    process.exit(0);
  }
}

testCreate();
