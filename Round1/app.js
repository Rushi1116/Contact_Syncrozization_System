const express = require('express');
const connection = require('./db');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

// API 1
//Sync user's contacts
app.post('/sync-contacts', async (req, res) => {
  try {
    const { userId, contacts } = req.body;
    const encryptedContacts = contacts.map((contact) => ({
      name: contact.name,
      number: contact.number,
      encryptedNumber: bcrypt.hashSync(contact.number, 10)
    }));

    const uniqueContacts = [];

    for (const contact of encryptedContacts) {
      const count = await getContactCount(userId, contact.encryptedNumber);

      if (count === 0) {
        uniqueContacts.push(contact);
      }
    }

    console.log('Unique Contacts:', uniqueContacts);

    await saveContacts(userId, uniqueContacts);

    res.json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error syncing contacts:', error);
    res.status(500).json({ success: false, message: 'Failed to sync contacts' });
  }
});

//function to get contact count
async function getContactCount(userId, encryptedNumber) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT COUNT(*) AS count FROM contacts WHERE userId = ? AND encryptedNumber = ?';
    const values = [userId, encryptedNumber];
    connection.query(query, values, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result[0].count);
    });
  });
}

//function to save contacts
async function saveContacts(userId, contacts) {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO contacts (userId, name, number, encryptedNumber) VALUES ?';
    const insertValues = contacts.map((contact) => [userId, contact.name, contact.number, contact.encryptedNumber]);
    connection.query(query, [insertValues], (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

// API 2 
//Find common users for a particular number
app.get('/common-users', (req, res) => {
  const searchNumber = req.query.searchNumber;
  const query = `
    SELECT name, GROUP_CONCAT(userId) AS commonUsers
    FROM contacts
    WHERE number = ?
    GROUP BY name
  `;
  connection.query(query, [searchNumber], (err, results) => {
    if (err) {
      console.error('Error finding common users:', err);
      res.status(500).json({ success: false, message: 'Failed to find common users' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ success: false, message: 'No common users found' });
      return;
    }
    const { name, commonUsers } = results[0];
    res.json({ name, commonUsers: commonUsers.split(',') });
  });
});

// API 3
//Get contacts by userId with pagination and name search
app.get('/contacts', (req, res) => {
  const { userId, page, pageSize, searchText } = req.query;


  const offset = (parseInt(page) - 1) * parseInt(pageSize);


  let sqlQuery = `SELECT name, number FROM contacts WHERE userId = ?`;

  if (searchText) {
    sqlQuery += ` AND name LIKE '%${searchText}%'`;
  }

  sqlQuery += ` LIMIT ? OFFSET ?`;

  connection.query(
    sqlQuery,
    [userId, parseInt(pageSize), offset],
    (error, results) => {
      if (error) {
        console.error('Error getting contacts:', error);
        res.status(500).json({ error: 'Failed to get contacts' });
      } else {
        
        connection.query(
          `SELECT COUNT(*) AS totalCount FROM contacts WHERE userId = ?`,
          [userId],
          (countError, countResults) => {
            if (countError) {
              console.error('Error getting total count:', countError);
              res.status(500).json({ error: 'Failed to get total count' });
            } else {
              const totalCount = countResults[0].totalCount;
              const response = {
                totalCount,
                rows: results
              };
              res.json(response);
            }
          }
        );
      }
    }
  );
});



const port = 3000;  // Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
