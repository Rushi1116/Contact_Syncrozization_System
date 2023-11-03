#Contact synchronisation system

Description of project -
1> API for synchronizing user contacts, ensuring no duplicate contacts are saved and encrypting phone numbers.
2> API to find common users for a specific phone number.
3> API to retrieve contacts by user ID with pagination and name search functionality.

# Machine specifications
I have used 
- Win11 64bit
- vscode
- postman
- Node.js (version 18.16.1 LTS) & npm (version 9.7.2)
- MySQL (version 8.0.31)

#Prerequisites before running project - 
1> Using git bash, Clone repository ->  git clone https://github.com/Rushi1116/Contact_Syncrozization_System.git
2> using vscode terminal navigate to project directory -> cd Round1
3> installing dependencies using npm, it will create node_modules file -> npm install
4> after that we will update database configuration file (db.js) as,
    const pool = mysql.createPool({
    host: ******,        //localhost
    user: ******,        //db user
    password: ******,    //db password
    database: ******,    //db name
    });

5> importing "db_api_contacts.sql" file in mysql, this will create database automatically.

# We are ready for Running application.
    to start the server, use command -> node app.js

    The server will start on port localhost: 3000.

#API Testing -
1> I used Postman (export file "api_testing.postman_collection.json" in project folder)


# API1 : Sync user's contacts
End point : POST http://localhost:3000/sync-contacts
Request body : 
{
  "userId": 1,
  "contacts": [
    {"name": "giten", "number": "1546857475"},
    {"name": "kiran", "number": "7895641253"},
    {"name": "prabhu", "number": "9637418521"}
  ]
}
Response :
{
  "success": true,
  "message": "Contacts saved successfully"
}


# API2: Find common user for a particular number
Endpoint: GET http://localhost:3000/common-users?searchNumber=2234567777
Response:
{
  "Name": "sahil",
  "commonUsers": [1, 2]
}


#API 3: Get contacts by userId
Endpoint: GET http://localhost:3000/contacts?userId=2&page=1&pageSize=2&searchText=sah
Response:
{
    "totalCount": 2,
    "rows": [
        {
            "name": "sahil",
            "number": "2234567777"
        }
    ]
}

***Finish***



