const { pool, buildWhereClause } = require('../database');

exports.getFilterOptions = async (req, res) => {
  try {
    // Get date range from request body (if provided)
    const filters = req.body?.filters || {};
    const { whereClause, params } = buildWhereClause(filters);

    // Build base query with date filtering
    const baseQuery = `FROM metrics.kafka_application_metrics ${whereClause}`;

    // Build additional WHERE conditions for non-null fields
    const additionalWhere = whereClause ? ' AND ' : ' WHERE ';

    const [clusters, namespaces, environments, applications, poolIds, dataPlanes, motsIds, dates] = await Promise.all([
      pool.query(`SELECT DISTINCT cluster_name ${baseQuery} ORDER BY cluster_name`, params),
      pool.query(`SELECT DISTINCT namespace ${baseQuery} ORDER BY namespace`, params),
      pool.query(`SELECT DISTINCT environment ${baseQuery}${additionalWhere}environment IS NOT NULL ORDER BY environment`, params),
      pool.query(`SELECT DISTINCT application_name ${baseQuery}${additionalWhere}application_name IS NOT NULL ORDER BY application_name`, params),
      pool.query(`SELECT DISTINCT pool_id ${baseQuery} ORDER BY pool_id`, params),
      pool.query(`SELECT DISTINCT data_plane ${baseQuery}${additionalWhere}data_plane IS NOT NULL ORDER BY data_plane`, params),
      pool.query(`SELECT DISTINCT mots_id ${baseQuery}${additionalWhere}mots_id IS NOT NULL ORDER BY mots_id`, params),
      pool.query('SELECT MIN(metric_date) as min_date, MAX(metric_date) as max_date FROM metrics.kafka_application_metrics')
    ]);

    res.json({
      clusters: clusters.rows.map(r => r.cluster_name).filter(Boolean),
      namespaces: namespaces.rows.map(r => r.namespace).filter(Boolean),
      environments: environments.rows.map(r => r.environment).filter(Boolean),
      applications: applications.rows.map(r => r.application_name).filter(Boolean),
      poolIds: poolIds.rows.map(r => r.pool_id).filter(Boolean),
      dataPlanes: dataPlanes.rows.map(r => r.data_plane).filter(Boolean),
      motsIds: motsIds.rows.map(r => r.mots_id).filter(Boolean),
      dateRange: {
        minDate: dates.rows[0]?.min_date,
        maxDate: dates.rows[0]?.max_date
      }
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Failed to fetch filter options', details: error.message });
  }
};

exports.getMetricsSummary = async (req, res) => {
  try {
    const filters = req.body.filters || {};
    const { whereClause, params } = buildWhereClause(filters);

    const query = `
      SELECT 
        COALESCE(SUM(consumedbytes), 0)::text as total_consumed,
        COALESCE(SUM(producedbytes), 0)::text as total_produced,
        COUNT(DISTINCT application_name) as active_applications,
        COUNT(DISTINCT cluster_name) as active_clusters
      FROM metrics.kafka_application_metrics
      ${whereClause}
    `;

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching metrics summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary', details: error.message });
  }
};

exports.getTimeSeries = async (req, res) => {
  try {
    const filters = req.body.filters || {};
    const { whereClause, params } = buildWhereClause(filters);

    const query = `
      SELECT 
        metric_date,
        COALESCE(SUM(consumedbytes), 0)::text as consumed,
        COALESCE(SUM(producedbytes), 0)::text as produced
      FROM metrics.kafka_application_metrics
      ${whereClause}
      GROUP BY metric_date
      ORDER BY metric_date ASC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching time series:', error);
    res.status(500).json({ error: 'Failed to fetch time series', details: error.message });
  }
};

exports.getTopApplications = async (req, res) => {
  try {
    const filters = req.body.filters || {};
    const { whereClause, params } = buildWhereClause(filters);

    const query = `
      SELECT 
        application_name,
        COALESCE(SUM(consumedbytes), 0)::text as consumed,
        COALESCE(SUM(producedbytes), 0)::text as produced
      FROM metrics.kafka_application_metrics
      ${whereClause}
      GROUP BY application_name
      ORDER BY (COALESCE(SUM(consumedbytes), 0) + COALESCE(SUM(producedbytes), 0)) DESC
      LIMIT 10
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching top applications:', error);
    res.status(500).json({ error: 'Failed to fetch top applications', details: error.message });
  }
};

exports.getEnvironmentDistribution = async (req, res) => {
  try {
    const filters = req.body.filters || {};
    const { whereClause, params } = buildWhereClause(filters);

    const query = `
      SELECT 
        environment,
        COALESCE(SUM(consumedbytes + producedbytes), 0)::text as total_bytes
      FROM metrics.kafka_application_metrics
      ${whereClause}
      GROUP BY environment
      ORDER BY COALESCE(SUM(consumedbytes + producedbytes), 0) DESC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching environment distribution:', error);
    res.status(500).json({ error: 'Failed to fetch environment data', details: error.message });
  }
};

exports.getClusterComparison = async (req, res) => {
  try {
    const filters = req.body.filters || {};
    const { whereClause, params } = buildWhereClause(filters);

    const query = `
      SELECT 
        cluster_name,
        COALESCE(SUM(consumedbytes), 0)::text as consumed,
        COALESCE(SUM(producedbytes), 0)::text as produced
      FROM metrics.kafka_application_metrics
      ${whereClause}
      GROUP BY cluster_name
      ORDER BY (COALESCE(SUM(consumedbytes), 0) + COALESCE(SUM(producedbytes), 0)) DESC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cluster comparison:', error);
    res.status(500).json({ error: 'Failed to fetch cluster data', details: error.message });
  }
};

exports.getNamespaceData = async (req, res) => {
  try {
    const filters = req.body.filters || {};
    const { whereClause, params } = buildWhereClause(filters);

    const query = `
      SELECT 
        namespace,
        COALESCE(SUM(consumedbytes + producedbytes), 0)::text as total_bytes
      FROM metrics.kafka_application_metrics
      ${whereClause}
      GROUP BY namespace
      ORDER BY COALESCE(SUM(consumedbytes + producedbytes), 0) DESC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching namespace data:', error);
    res.status(500).json({ error: 'Failed to fetch namespace data', details: error.message });
  }
};

exports.getTableData = async (req, res) => {
  try {
    const { filters = {}, page = 1, pageSize = 25 } = req.body;
    const offset = (page - 1) * pageSize;

    const { whereClause, params } = buildWhereClause(filters);

    const countQuery = `SELECT COUNT(*) as total FROM metrics.kafka_application_metrics ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Add LIMIT and OFFSET parameters
    const limitParam = `$${params.length + 1}`;
    const offsetParam = `$${params.length + 2}`;

    const dataQuery = `
      SELECT 
        metric_date,
        cluster_name,
        namespace,
        data_plane,
        environment,
        application_name,
        owners,
        stakeholders,
        mots_id,
        consumedbytes::text,
        producedbytes::text,
        pool_id
      FROM metrics.kafka_application_metrics
      ${whereClause}
      ORDER BY metric_date DESC
      LIMIT ${limitParam} OFFSET ${offsetParam}
    `;

    const dataResult = await pool.query(dataQuery, [...params, pageSize, offset]);

    res.json({
      data: dataResult.rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('Error fetching table data:', error);
    res.status(500).json({ error: 'Failed to fetch table data', details: error.message });
  }
};

exports.getApplicationPerformance = async (req, res) => {
  try {
    const filters = req.body.filters || {};
    const { whereClause, params } = buildWhereClause(filters);

    const query = `
      SELECT 
        application_name,
        environment,
        cluster_name,
        COALESCE(SUM(consumedbytes), 0)::text as total_consumed,
        COALESCE(SUM(producedbytes), 0)::text as total_produced,
        COUNT(DISTINCT metric_date) as active_days,
        AVG(consumedbytes + producedbytes)::text as avg_daily_volume
      FROM metrics.kafka_application_metrics
      ${whereClause}
      GROUP BY application_name, environment, cluster_name
      HAVING SUM(consumedbytes + producedbytes) > 0
      ORDER BY SUM(consumedbytes + producedbytes) DESC
      LIMIT 20
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching application performance:', error);
    res.status(500).json({ error: 'Failed to fetch application performance', details: error.message });
  }
};

exports.getMotsGrouping = async (req, res) => {
  try {
    const filters = req.body.filters || {};
    const { whereClause, params } = buildWhereClause(filters);

    const query = `
      SELECT 
        mots_id,
        application_name,
        environment,
        cluster_name,
        COALESCE(SUM(consumedbytes), 0)::text as total_consumed,
        COALESCE(SUM(producedbytes), 0)::text as total_produced,
        COUNT(DISTINCT metric_date) as active_days
      FROM metrics.kafka_application_metrics
      ${whereClause}
      GROUP BY mots_id, application_name, environment, cluster_name
      HAVING SUM(consumedbytes + producedbytes) > 0
      ORDER BY mots_id, SUM(consumedbytes + producedbytes) DESC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching MOTS grouping:', error);
    res.status(500).json({ error: 'Failed to fetch MOTS grouping', details: error.message });
  }
};