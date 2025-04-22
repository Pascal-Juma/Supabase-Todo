import { TextField, Card, Button, Typography } from "@mui/material";
import ModeIcon from "@mui/icons-material/Mode";
import DeleteIcon from "@mui/icons-material/Delete";
import "./Home.css";
import { useState, useEffect } from "react";
import { supabase } from "./supabase-client";

type homeProps = {
  id?: number;
  title: string;
  description: string;
  is_complete?: boolean;
  created_at?: string;
};
function Home() {
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  });
  const [tasks, setTasks] = useState<homeProps[]>([]);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { error, data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      return console.error("Error fetching task: ", error.message);
    }

    setTasks(data);
  };

  const toggleComplete = async (id: number, currentState: boolean) => {
    const { error } = await supabase
      .from("tasks")
      .update({ is_complete: !currentState })
      .eq("id", id);
    if (error) {
      return console.error("Error toggling complete: ", error.message);
    }

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, is_complete: !currentState } : task
      )
    );
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (updating !== null) {
      const { error } = await supabase
        .from("tasks")
        .update(newTask)
        .eq("id", updating);

      if (error) {
        return console.error("Error updating task: ", error.message);
      }

      setUpdating(null);
    } else {
      const { error } = await supabase.from("tasks").insert(newTask).single();
      if (error) {
        return console.error("Error adding task: ", error.message);
      }
    }

    setNewTask({ title: "", description: "" });
    fetchTasks();
  };

  const deleteTask = async (id: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      return console.error("Error deleting task:", error.message);
    }
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  return (
    <>
      <section className="home-section">
        <Typography
          variant="h2"
          mb={1}
          fontFamily="var(--prime)"
          fontSize="35px"
          fontWeight={600}
        >
          Task Manager
        </Typography>
        <Card
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", padding: "8px" }}
        >
          <TextField
            variant="outlined"
            sx={{ minWidth: 270, mb: 2 }}
            type="text"
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, title: e.target.value }))
            }
            label="Enter Title of your Todo"
          />
          <TextField
            variant="outlined"
            type="text"
            label="Enter Description of your Todo"
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          <Button variant="contained" sx={{ mt: 2 }} type="submit">
            {updating !== null ? "Save Changes" : "Add Todo"}
          </Button>
        </Card>
        <div className="task-view">
          <ul className="todo-list">
            {tasks.map((task, key) => (
              <li key={key} className="todo-item">
                <div className="task-items">
                  <h3
                    className={
                      task.is_complete ? "line-through" : "no-line"
                    }
                  >
                    {task.title}
                  </h3>
                  <p
                    className={
                      task.is_complete ? "line-through" : "no-line-through"
                    }
                  >
                    {task.description}
                  </p>
                </div>
                <div className="list-cta">
                  <Button
                    variant="contained"
                    size="small"
                    color={task.is_complete ? "secondary" : "success"}
                    onClick={() =>
                      toggleComplete(task.id!, task.is_complete ?? false)
                    }
                  >
                    {task.is_complete ? "Undo" : "Mark Done"}
                  </Button>

                  <Button
                    startIcon={<ModeIcon />}
                    variant="contained"
                    size="small"
                    onClick={() => {
                      setNewTask({
                        title: task.title,
                        description: task.description,
                      });
                      setUpdating(task.id ?? null);
                    }}
                  >
                    Edit
                  </Button>

                  <Button
                    startIcon={<DeleteIcon />}
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => task.id !== undefined && deleteTask(task.id)}
                  >
                    del
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

export default Home;
