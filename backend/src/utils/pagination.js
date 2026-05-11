function parsePagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 12, 1), 50);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

function buildPageMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    pages: Math.max(Math.ceil(total / limit), 1)
  };
}

module.exports = { parsePagination, buildPageMeta };
