// require('dotenv').config();
const http = require('http');
const express = require("express");
const app = express();
app.use(express.json());
// process.env.PORT is given by heroku
const port = process.env.PORT || 3000;
const { Pool } = require('pg');
// credientals for Heroku
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
    // "host": 'localhost',
    // "port": 5432,
    // "user": 'postgres',
    // "password": 'postgre123',
    // "database": 'Schedule'
});
// Tells you that the server is up
app.listen(port, ()=> console.log(`Server started on port ${port}`));
// index.html for main directory using express
app.get('/', (req, res) => res.sendFile(`${__dirname}/index.html`));
// Sorted class names file
app.get('/sortedClassName', (req, res) => res.sendFile(`${__dirname}/sortedName.html`));
app.get('/classInfo', async (req, res) => {
    // awaits for the file to read the JSON data from the get request before contiuning the promise
    const info = await readInfo();
    res.setHeader('content-type','application/json');
    res.send(JSON.stringify(info));
});
app.post('/classInfo', async (req, res) => {
    // creates the info to push onto the database
    let result = {};
    try{
        const reqJson = req.body;
        await createInfo(reqJson.classInfo);
        result.sucess = true;
    }catch(e){
        result.sucess = false;
        console.log(`Error ${e}`);
    }finally{
        res.setHeader('content-type','application/json');
        res.send(JSON.stringify(result));
    }
});
app.delete("/classInfo", async (req, res) => {
    // deletes the info off the database
    let result = {}
    try{
        const reqJson = req.body;
        result.success = await deleteInfo(reqJson.id)
    }
    catch(e){
        result.success=false;
    }
    finally{
        res.setHeader('content-type','application/json');
        res.send(JSON.stringify(result));
    }
});
// same thing as read but for the sorted page
app.get("/sortedInfo", async (req, res) => {
    let result = {}
    try{
        const reqJson = req.body;
        result.success = await sortInfo(reqJson.id)
    }
    catch(e){
        result.success=false;
    }
    finally{
        res.setHeader('content-type','application/json');
        res.send(JSON.stringify(result));
    }
});
app.post('/sortedInfo', async (req, res) => {
    let result = {};
    try{
        const reqJson = req.body;
        await createInfo(reqJson.classInfo);
        result.sucess = true;
    }catch(e){
        result.sucess = false;
        console.log(`Error ${e}`);
    }finally{
        res.setHeader('content-type','application/json');
        res.send(JSON.stringify(result));
    }
});
app.delete("/sortedInfo", async (req, res) => {
    let result = {}
    try{
        const reqJson = req.body;
        result.success = await deleteInfo(reqJson.id)
    }
    catch(e){
        result.success=false;
    }
    finally{
        res.setHeader('content-type','application/json');
        res.send(JSON.stringify(result));
    }
});

// connect();
start();
// more conventional when needed to connect to multiple databases and use promises in the start function
async function start(){
    await connect();
}
async function connect(){
    try{
        await pool.connect();
    }catch(e){
        console.log(`Error ${e}`);
    }
}
// query for read
async function readInfo(){
    try{
        const res = await pool.query('SELECT * FROM classlist;');
        return res.rows;
    }catch(e){
        return[];
    }
}
// query for read sorted
async function sortInfo(){
    try{
        const res = await pool.query('SELECT * FROM classlist ORDER BY course_name');
        return res.rows;
    }catch(e){
        return[];
    }
}
// query for post
async function createInfo(info){
    try{
        console.log(info);
        await pool.query(`INSERT INTO classlist(course_name,professor,days,time,duration,student_cap,isGrad) VALUES($1,$2,$3,$4,$5,$6,$7)`,[info[0],info[1],info[5],info[2],info[3],info[4],info[6]]);
        return true;
    }catch (e){
        console.log(e);
        return false;
    }
}
// query for delete
async function deleteInfo(id){
    try {
        await pool.query("DELETE FROM classlist WHERE id = $1", [id]);
        return true;
    }
    catch(e){
        console.log(`Error ${e}`);
        return false;
    }
}