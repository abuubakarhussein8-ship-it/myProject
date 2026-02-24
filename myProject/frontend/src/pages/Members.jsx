import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { membersAPI } from "../services/api";

const EMPTY_MEMBER = {
  username: "",
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  role: "member",
  member_type: "student",
  member_profile: {
    phone: "",
    address: "",
    membership_expiry: "",
  },
};

function Members() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState(EMPTY_MEMBER);

  const fetchMembers = async (currentPage = page) => {
    setLoading(true);
    try {
      const response = await membersAPI.getAll({ page: currentPage, page_size: 10 });
      setMembers(response.data.results || []);
      setCount(response.data.count || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [page]);

  const openCreate = () => {
    setEditingMember(null);
    setForm(EMPTY_MEMBER);
    setShowModal(true);
  };

  const openEdit = (member) => {
    setEditingMember(member);
    setForm({
      ...EMPTY_MEMBER,
      ...member,
      password: "",
      member_profile: {
        ...EMPTY_MEMBER.member_profile,
        ...(member.member_profile || {}),
      },
    });
    setShowModal(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    if (editingMember) await membersAPI.update(editingMember.id, payload);
    else await membersAPI.create(payload);
    setShowModal(false);
    fetchMembers();
  };

  const deleteMember = async (id) => {
    if (!window.confirm("Delete this member?")) return;
    await membersAPI.delete(id);
    fetchMembers();
  };

  const filtered = members.filter((member) =>
    `${member.username} ${member.email} ${member.first_name || ""} ${member.last_name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const maxPage = Math.max(1, Math.ceil(count / 10));

  return (
    <div>
      <h1>Members Management</h1>
      <div className="search-container">
        <input className="form-control" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search members..." />
        <button className="btn btn-success" onClick={openCreate}>Add Member</button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Type</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.id}>
                  <td>{member.username}</td>
                  <td>{member.email}</td>
                  <td>{member.first_name} {member.last_name}</td>
                  <td>{member.role}</td>
                  <td>{member.member_type || "-"}</td>
                  <td>{member.member_profile?.phone || "-"}</td>
                  <td>
                    <button className="btn btn-warning" onClick={() => openEdit(member)}>Edit</button>
                    {user?.role === "admin" && (
                      <button className="btn btn-danger" onClick={() => deleteMember(member.id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button className="btn btn-primary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span>Page {page} / {maxPage}</span>
            <button className="btn btn-primary" disabled={page >= maxPage} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </>
      )}

      {showModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingMember ? "Edit Member" : "Create Member"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Username</label>
                <input className="form-control" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Password {editingMember ? "(optional)" : ""}</label>
                <input type="password" className="form-control" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingMember} />
              </div>
              <div className="form-group">
                <label>First Name</label>
                <input className="form-control" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input className="form-control" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select className="form-control" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="member">member</option>
                  <option value="librarian">librarian</option>
                  {user?.role === "admin" && <option value="admin">admin</option>}
                </select>
              </div>
              <div className="form-group">
                <label>Member Type</label>
                <select className="form-control" value={form.member_type || "student"} onChange={(e) => setForm({ ...form, member_type: e.target.value })}>
                  <option value="student">student</option>
                  <option value="teacher">teacher</option>
                  <option value="faculty">faculty</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="form-control" value={form.member_profile?.phone || ""} onChange={(e) => setForm({ ...form, member_profile: { ...form.member_profile, phone: e.target.value } })} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea className="form-control" value={form.member_profile?.address || ""} onChange={(e) => setForm({ ...form, member_profile: { ...form.member_profile, address: e.target.value } })} />
              </div>
              <div className="form-group">
                <label>Membership Expiry</label>
                <input type="date" className="form-control" value={form.member_profile?.membership_expiry || ""} onChange={(e) => setForm({ ...form, member_profile: { ...form.member_profile, membership_expiry: e.target.value } })} />
              </div>
              <button className="btn btn-primary" type="submit">Save Member</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;
