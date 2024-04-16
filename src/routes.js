import { Database } from './database.js';
import { randomUUID } from 'node:crypto';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: async (req, res) => {
      console.log(req.query)
      const { search } = req.query
      const tasks = database.select('tasks', search ? {
        title: search
      } : null)

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: async (req, res) => {
      const { title, description } = req.body

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      database.insert('tasks', task)

      return res.writeHead(201).end()
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: async (req, res) => {
      const { id } = req.params
      const { title, description } = req.body

      database.update('tasks', id, {
        title,
        description,
        completed_at: database.select('tasks', null, id).completed_at,
        created_at: database.select('tasks', null, id).created_at,
        updated_at: new Date().toISOString()
      })

      return res.writeHead(204).end()
    }

  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: async (req, res) => {
      const { id } = req.params

      database.delete('tasks', id )

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: async (req, res) => {
      const { id } = req.params

      const task = database.select('tasks', null, id)
      
      if (task) {
        database.update('tasks', id, {
          title: task.title,
          description: task.description,
          completed_at: new Date().toISOString(),
          created_at: task.created_at,
          updated_at: new Date().toISOString()
        })
      } else {
        return res.writeHead(404).end()
      }

      return res.writeHead(204).end()
    }
  }
]