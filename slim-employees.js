const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'employees.json');
const raw = fs.readFileSync(file, 'utf8');
const data = JSON.parse(raw);

function slimProject(p) {
  return {
    project_id: p.project_id,
    project_name: p.project_name,
    completed_on_time: p.completed_on_time,
    team_members: Array.isArray(p.team_members) ? p.team_members.map(tm => tm.eid) : []
  };
}

function slimEmployee(e) {
  const projects = Array.isArray(e.projects) ? e.projects.slice(0, 2).map(slimProject) : [];
  return {
    eid: e.eid,
    name: e.name,
    email: e.email,
    projects
  };
}

const slim = {
  employees: Array.isArray(data.employees) ? data.employees.slice(0, 15).map(slimEmployee) : []
};

// Write minified JSON to reduce tokens
fs.writeFileSync(file, JSON.stringify(slim));

console.log(`Slimmed employees.json: ${slim.employees.length} employees, max 2 projects each.`);
