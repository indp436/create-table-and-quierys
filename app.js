const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
const convertToResponseData = (obj) => {
  return {
    id: obj.id,
    todo: obj.todo,
    priority: obj.priority,
    status: obj.status,
  };
};

///API 1
app.get("/todos/", async (request, response) => {
  var { search_q, status, priority } = request.query;

  var getTodoQuery = null;

  if (status == "IN PROGRESS" && priority == "HIGH") {
    var getTodoQuery = `
    SELECT
      *
    FROM
      todo
      WHERE  status LIKE'${status}' AND priority LIKE '${priority}'
      
      
      
      ;`;
  } else {
    var getTodoQuery = `
    SELECT
      *
    FROM
      todo
      WHERE 
       status LIKE '${status}'
       OR 
       priority LIKE '${priority}'
      OR (todo LIKE '%${search_q}%')
      
      
      ;`;
  }

  const TodoArray = await db.all(getTodoQuery);

  response.send(TodoArray.map((each) => convertToResponseData(each)));
});

///API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
      WHERE id = ${todoId}`;
  const TodoArray = await db.get(getTodoQuery);
  response.send(convertToResponseData(TodoArray));
});
///API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteToDoQuery = `
    DELETE FROM
      todo
    WHERE
      id = ${todoId};`;
  await db.run(deleteToDoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
