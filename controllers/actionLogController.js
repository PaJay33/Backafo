const ActionLog = require('../models/actionLogModel');

// Fonction utilitaire pour créer un log
const createLog = async (logData) => {
  try {
    const log = await ActionLog.create(logData);
    return log;
  } catch (error) {
    console.error('Erreur lors de la création du log:', error);
    // Ne pas faire échouer l'opération principale si le logging échoue
    return null;
  }
};

// Récupérer tous les logs (avec pagination et filtres)
const getAllLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Filtres optionnels
    const filters = {};

    if (req.query.action) {
      filters.action = req.query.action;
    }

    if (req.query.userId) {
      filters.userId = req.query.userId;
    }

    if (req.query.targetType) {
      filters.targetType = req.query.targetType;
    }

    if (req.query.startDate || req.query.endDate) {
      filters.createdAt = {};
      if (req.query.startDate) {
        filters.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filters.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const logs = await ActionLog.find(filters)
      .populate('userId', 'nom prenom email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ActionLog.countDocuments(filters);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des logs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des logs',
      error: error.message
    });
  }
};

// Récupérer les logs d'un utilisateur spécifique
const getUserLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await ActionLog.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ActionLog.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des logs utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des logs utilisateur',
      error: error.message
    });
  }
};

// Récupérer les statistiques des logs
const getLogStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Statistiques par action
    const actionStats = await ActionLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Statistiques par utilisateur
    const userStats = await ActionLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$userId',
          userName: { $first: '$userName' },
          userRole: { $first: '$userRole' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Statistiques par type de cible
    const targetStats = await ActionLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$targetType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Montant total des transactions financières
    const financialStats = await ActionLog.aggregate([
      {
        $match: {
          ...dateFilter,
          montant: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          totalMontant: { $sum: '$montant' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        actionStats,
        userStats,
        targetStats,
        financialStats: financialStats[0] || { totalMontant: 0, count: 0 }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

module.exports = {
  createLog,
  getAllLogs,
  getUserLogs,
  getLogStats
};
