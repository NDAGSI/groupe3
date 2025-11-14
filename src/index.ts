import express from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json());

let db = { projects: [] };

const ProjectSchema = z.object({
  studentName: z.string(),
  course: z.string(),
  githubUrl: z.string().url(),
});

app.post('/projects', (req, res) => {
  const validation = ProjectSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }
  const newProject = {
    id: Date.now(),
    ...validation.data,
  };
  db.projects.push(newProject);
  res.status(201).json(newProject);
});

app.listen(3000, () => console.log('API running on port 3000'));