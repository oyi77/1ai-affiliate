/**
 * Consistent API response helpers.
 */

function success(res, data, status = 200) {
  return res.status(status).json(data);
}

function created(res, data) {
  return res.status(201).json(data);
}

function error(res, message, status = 500) {
  return res.status(status).json({ error: message });
}

function paginated(res, rows, total, page, limit) {
  return res.json({
    data: rows,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  });
}

module.exports = { success, created, error, paginated };
