import pool from "../db.js";

export async function getNotificationTokensByIdGuru(id_guru) {
  const query = `
      SELECT T.token
      FROM Notification_Token T
      JOIN Guru G ON T.id_user = G.id_user
      WHERE G.id_guru = $1;
    `;

  const values = [id_guru];
  const result = await pool.query(query, values);
  return result;
}

export async function createOrUpdateToken(id_guru, token, device_name) {
  const query = `
      INSERT INTO Notification_Token (id_guru, token, device_name)
      VALUES ($1, $2, $3)
      ON CONFLICT (token) 
      DO UPDATE SET
        id_guru = EXCLUDED.id_guru,
        device_name = EXCLUDED.device_name,
        created_at = NOW()
      RETURNING *;
    `;

  const values = [id_guru, token, device_name];
  const result = await pool.query(query, values);
  return result;
}

export const getNotificationTokenByDeviceId = async (device_id) => {
  const query = `
  SELECT * FROM Notification_Token WHERE device_id = $1;
`;

  const values = [device_id];

  const result = await pool.query(query, values);
  return result;
};

export const updateNotificationTokenById = async (id_notification_token, { id_guru, notification_token }) => {
  const query = `
        UPDATE Notification_Token
        SET id_guru = $1,
        notification_token = $2
        WHERE id_notification_token = $3
        RETURNING *;
    `;

  const values = [id_guru, notification_token, id_notification_token];

  const result = await pool.query(query, values);
  return result;
};

export const insertNotificationToken = async ({ id_guru, device_id, device_name, notification_token }) => {
  const query = `
      INSERT INTO Notification_Token (
          id_guru,
          device_id,
          device_name,
          notification_token
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *;
  `;

  const values = [id_guru, device_id, device_name, notification_token];

  const result = await pool.query(query, values);
  return result;
};

export const deleteNotificationToken = async (id_guru, device_id) => {
  const query = `
    DELETE FROM notification_token
    WHERE id_guru = $1 AND device_id = $2
    RETURNING *;
  `;
  const deleteResult = await pool.query(query, [id_guru, device_id]);

  return deleteResult;
};
