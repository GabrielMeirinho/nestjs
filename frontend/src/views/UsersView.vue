<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import type { User } from '../api/users';
import { fetchUsers, createUser, updateUser, deleteUser } from '../api/users';

const users = ref<User[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const isEditing = ref(false);

const form = reactive({
  id: null as number | null,
  name: '',
  email: '',
});

async function loadUsers() {
  loading.value = true;
  errorMessage.value = null;

  try {
    users.value = await fetchUsers();
  } catch (err) {
    console.error(err);
    errorMessage.value = 'Failed to load users.';
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.id = null;
  form.name = '';
  form.email = '';
  isEditing.value = false;
}

function editUser(user: User) {
  form.id = user.id;
  form.name = user.name;
  form.email = user.email;
  isEditing.value = true;
}

async function submitForm() {
  if (!form.name || !form.email) {
    errorMessage.value = 'Name and email are required.';
    return;
  }

  loading.value = true;
  errorMessage.value = null;

  try {
    if (form.id === null) {
      const created = await createUser({
        name: form.name,
        email: form.email,
      });
      users.value.push(created);
    } else {
      const updated = await updateUser(form.id, {
        name: form.name,
        email: form.email,
      });
      const idx = users.value.findIndex((u) => u.id === form.id);
      if (idx !== -1) users.value[idx] = updated;
    }

    resetForm();
  } catch (err: any) {
    console.error(err);

    if (err.response?.data) {
      const d = err.response.data;

      if (d.statusCode === 409) {
        errorMessage.value =
          d.message ||
          d.detail ||
          'A user with this email already exists.';
      } else if (d.message) {
        errorMessage.value = Array.isArray(d.message)
          ? d.message.join(', ')
          : d.message;
      } else {
        errorMessage.value = 'Error saving user.';
      }
    } else {
      errorMessage.value = 'Error saving user.';
    }
  } finally {
    loading.value = false;
  }
}

async function removeUser(user: User) {
  if (!window.confirm(`Delete user "${user.name}"?`)) return;

  loading.value = true;

  try {
    await deleteUser(user.id);
    users.value = users.value.filter((u) => u.id !== user.id);
  } catch (err) {
    console.error(err);
    errorMessage.value = 'Error deleting user.';
  } finally {
    loading.value = false;
  }
}

onMounted(loadUsers);
</script>

<template>
  <div class="users-page">
    <h1>Users</h1>

    <section class="form-section">
      <h2>{{ isEditing ? 'Edit user' : 'Create user' }}</h2>

      <form @submit.prevent="submitForm" class="user-form">
        <div class="form-row">
          <label for="name">Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="User name"
          />
        </div>

        <div class="form-row">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="user@example.com"
          />
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="loading">
            {{ isEditing ? 'Save changes' : 'Create user' }}
          </button>
          <button type="button" @click="resetForm" :disabled="loading">
            Clear
          </button>
        </div>
      </form>

      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>
    </section>

    <section class="list-section">
      <h2>Existing users</h2>

      <p v-if="loading && !users.length">Loading users...</p>
      <p v-else-if="!users.length">No users yet.</p>

      <table v-else class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th style="width: 160px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <button type="button" @click="editUser(user)" :disabled="loading">
                Edit
              </button>
              <button
                type="button"
                @click="removeUser(user)"
                :disabled="loading"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.users-page {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
}

h1 {
  margin-bottom: 1rem;
}

.form-section,
.list-section {
  margin-bottom: 2rem;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 400px;
}

.form-row {
  display: flex;
  flex-direction: column;
}

.form-row label {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.form-row input {
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

button {
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  border: 1px solid #444;
  background: #444;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
}

button[disabled] {
  opacity: 0.6;
  cursor: default;
}

button:nth-child(2) {
  background: #eee;
  color: #333;
  border-color: #ccc;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
}

.users-table th,
.users-table td {
  border: 1px solid #ddd;
  padding: 0.4rem 0.6rem;
}

.users-table th {
  background: #f5f5f5;
}

.error {
  margin-top: 0.5rem;
  color: #b00020;
}
</style>
