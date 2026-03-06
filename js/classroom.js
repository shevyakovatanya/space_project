export function initClassroomPage() {
  fetch('api/me.php', { credentials: 'include' })
    .then(r => r.json())
    .then(me => {
      if (!me.user || me.user.role !== 'teacher') {
        window.location.href = 'index.html';
        return;
      }

      return fetch('api/classroom.php', { credentials: 'include' });
    })
    .then(r => {
      if (!r) return;
      if (!r.ok) throw new Error('classroom.php error');
      return r.json();
    })
    .then(data => {
      if (!data || !data.success) throw new Error('No data');

      const title = document.getElementById('classTitle');
      if (title) title.textContent = `Class ${data.class}`;

      const teachersList = document.getElementById('teachersList');
      if (teachersList) {
        teachersList.innerHTML = '';
        data.teachers.forEach(login => {
          const li = document.createElement('li');
          li.textContent = login;
          teachersList.appendChild(li);
        });
      }

      const body = document.getElementById('studentsBody');
      if (!body) return;
      body.innerHTML = '';

      const keys = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

      data.students.forEach(st => {
        let resultsObj = {};
        try {
          resultsObj = JSON.parse(st.results || '{}');
        } catch {
          resultsObj = {};
        }

        let total = 0;
        keys.forEach(k => (total += Number(resultsObj[k] ?? 0)));

        const tr = document.createElement('tr');

        const tdLogin = document.createElement('td');
        tdLogin.textContent = st.username;
        tr.appendChild(tdLogin);

        keys.forEach(k => {
          const td = document.createElement('td');
          td.textContent = resultsObj[k] ?? 0;
          tr.appendChild(td);
        });

        const tdTotal = document.createElement('td');
        tdTotal.textContent = total;
        tr.appendChild(tdTotal);

        body.appendChild(tr);
      });
    })
    .catch(err => {
      console.error(err);
      window.location.href = 'index.html';
    });
}
