/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {

  // user table
  const User = sequelize.define('user', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      field: 'id',
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'username'
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'firstname'
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'lastName'
    },
    middleName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'middleName'
    },
    preferredName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'preferredName'
    },
    prefix: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'prefix'
    },
    suffix: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'suffix'
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'position'
    },
    address1: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'address1'
    },
    address2: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'address2'
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'city'
    },
    state: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'state'
    },
    country: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'country'
    },
    zip: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'zip'
    },
    points: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0',
      field: 'points'
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'dateOfBirth'
    },
    preferredPronoun: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'preferredPronoun'
    },
    sex: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'sex'
    },
    gender: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'gender'
    },
    dateOfHire: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'dateOfHire'
    },
    dateOfTermination: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'dateOfTermination'
    },
    departmentId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'department',
        key: 'id'
      },
      field: 'departmentId'
    },
    securityRoleId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'securityrole',
        key: 'id'
      },
      field: 'securityRoleId'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'email'
    },
    avatarUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 'public/avatars/placeholder.svg',
      field: 'avatarUrl'
    },
    phone: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'phone'
    },
    active: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1,
      field: 'active',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updatedAt'
    },
  }, {
    tableName: 'user'
  });


  // department table
  const Department = sequelize.define('department', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      field: 'id',
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'name'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updatedAt'
    }
  }, {
    tableName: 'department'
  });

  Department.hasMany(User, {foreignKey: 'departmentId', sourceKey: 'id'});
  User.belongsTo(Department, {foreignKey: 'departmentId', targetKey: 'id'});

  // securityrole table
  const SecurityRole = sequelize.define('securityrole', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      field: 'id',
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'name'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'description'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updatedAt'
    }
  }, {
    tableName: 'securityrole'
  });

  SecurityRole.hasMany(User, {foreignKey: 'securityRoleId', sourceKey: 'id'});
  User.belongsTo(SecurityRole, {foreignKey: 'securityRoleId', targetKey: 'id'});

  // achievement table
  const Achievement = sequelize.define('achievement', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      field: 'id',
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'name'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'description'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updatedAt'
    },
    status: {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue: 'Active',
      field: 'status'
    },
    cost: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '100',
      field: 'cost'
    },
    incrementAmount: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1',
      field: 'increment_amount'
    },
    startAmount: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0',
      field: 'start_amount'
    },
    achievementFamily: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'achievement_family'
    },
    level: {
      type: DataTypes.INTEGER(3),
      allowNull: false,
      defaultValue: '1',
      field: 'level'
    },
  }, {
    tableName: 'achievement'
  });

  // achievement_transaction table
  const AchievementTransaction = sequelize.define('achievementTransaction', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      field: 'id',
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue: 'Add',
      field: 'type'
    },
    amount: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      field: 'amount'
    },
    userAchievementId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'user_achievement_progress',
        key: 'id'
      },
      field: 'user_achievement_id'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'description'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updatedAt'
    }
  }, {
    tableName: 'achievement_transaction'
  });



  // user_achievement_progress table
  const UserAchievementProgress = sequelize.define('userAchievementProgress', {
    userId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
/*      references: {
        model: 'user',
        key: 'id'
      },*/
      field: 'user_id'
    },
    achievementId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
/*      references: {
        model: 'achievement',
        key: 'id'
      },*/
      field: 'achievement_id'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updatedAt'
    },
    goalProgress: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0',
      field: 'goalProgress'
    },
    id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      field: 'id'
    },
    status: {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue: 'not started',
      field: 'status'
    }
  }, {
    tableName: 'user_achievement_progress'
  });

  AchievementTransaction.belongsTo(UserAchievementProgress, {foreignKey: 'userAchievementId', targetKey: 'id'});
  UserAchievementProgress.hasMany(AchievementTransaction, {foreignKey: 'userAchievementId', sourceKey: 'id'});
  UserAchievementProgress.belongsTo(Achievement, {foreignKey: 'achievementId', targetKey: 'id'});
  UserAchievementProgress.belongsTo(User, {foreignKey: 'userId', targetKey: 'id'});
  User.hasMany(UserAchievementProgress, {foreignKey: 'userId', sourceKey: 'id'});
  Achievement.hasMany(UserAchievementProgress, {foreignKey: 'achievementId', sourceKey: 'id'});

  // point_item table
  const PointItem = sequelize.define('pointItem', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      field: 'id',
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'name'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'description'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updatedAt'
    },
    amount: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      field: 'amount'
    },
    coreValues: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'core_values'
    }
  }, {
    tableName: 'point_item'
  });

  // point_transaction table
  const PointTransaction = sequelize.define('pointTransaction', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      field: 'id',
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue: 'Add',
      field: 'type'
    },
    amount: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      field: 'amount'
    },
    sourceUserId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
/*      references: {
        model: 'user',
        key: 'id'
      },*/
      field: 'sourceUserId'
    },
    targetUserId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
/*      references: {
        model: 'user',
        key: 'id'
      },*/
      unique: true,
      field: 'targetUserId'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'description'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updatedAt'
    },
    pointItemId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
/*      references: {
        model: 'point_item',
        key: 'id'
      },*/
      field: 'point_item_id'
    }
  }, {
    tableName: 'point_transaction'
  });

  PointTransaction.belongsTo(User, {foreignKey: 'targetUserId', targetKey: 'id', as: 'targetUser'});
  PointTransaction.belongsTo(User, {foreignKey: 'sourceUserId', targetKey: 'id', as: 'sourceUser'});
  PointTransaction.belongsTo(PointItem, {foreignKey: 'pointItemId', targetKey: 'id'});
  User.hasMany(PointTransaction, {foreignKey: 'targetUserId', sourceKey: 'id', as: 'targetUser'});
  User.hasMany(PointTransaction, {foreignKey: 'sourceUserId', sourceKey: 'id', as: 'sourceUser'});
  PointItem.hasMany(PointTransaction, {foreignKey: 'pointItemId', sourceKey: 'id'});

  // point_pool table
  const PointPool = sequelize.define('pointPool', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      field: 'id',
      autoIncrement: true
    },
    pointsRemaining: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '5000',
      field: 'points_remaining'
    },
    managerId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'user',
        key: 'id'
      },
      field: 'managerId'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updatedAt'
    }
  }, {
    tableName: 'point_pool'
  });

  PointPool.belongsTo(User, {foreignKey: 'managerId', targetKey: 'id'});
  User.hasOne(PointPool, {foreignKey: 'managerId', sourceKey: 'id'});


  // like_info table
  const LikeInfo = sequelize.define('likeInfo', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      field: 'id',
      primaryKey: true,
      autoIncrement: true,

    },
    postId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
/*      references: {
        model: 'point_transaction',
        key: 'id'
      },*/
      field: 'post_id'
    },
    username:{
      type: DataTypes.STRING(45),
      allowNull: false,
/*      references: {
        model: 'user',
        key: 'username'
      },*/
      field: 'username'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updatedAt'
    },
  }, {
    tableName: 'like_info'
  });

  LikeInfo.belongsTo(PointTransaction, {foreignKey: 'postId', targetKey: 'id'});
  LikeInfo.belongsTo(User, {foreignKey: 'username', targetKey: 'username'});
  User.hasMany(LikeInfo, {foreignKey: 'username', sourceKey: 'username'});
  PointTransaction.hasMany(LikeInfo, {foreignKey: 'postId', sourceKey: 'id'});

  // notification table
  const Notification = sequelize.define('notification', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      field: 'id',
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'title'
    },
    audience: {
      //Three Types:  Persoanl Group Global
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'audience'
    },
    event: {
      // Archiev Point
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'event'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    description: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'description'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updatedAt'
    },
    timeSeen: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'timeSeen'
    },
    targetUserId:{
      type: DataTypes.STRING(20),
      allowNull:false,
      field: 'targetUserId'
    }
  }, {
    tableName: 'notification'
  });


  // metrics table
  const Metrics = sequelize.define('metrics', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      field: 'id',
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'user',
        key: 'id'
      },
      field: 'userId'
    },
    lastLogonDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'lastLogonDate'
    },
    lastLogoffDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'lastLogoffDate'
    },
    numLogons: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numLogons'
    },
    numLogoffs: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numLogoffs'
    },
    totalPointsReceived: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'totalPointsReceived'
    },
    lastPointTransactionDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'lastPointTransactionDate'
    },
    totalAchievementPointsEarned: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'totalAchievementPointsEarned'
    },
    totalAchievementsEarned: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'totalAchievementsEarned'
    },
    lastPointItemName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'lastPointItemName'
    },
    totalLoggedSeconds: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'totalLoggedSeconds'
    },
    accountAgeDays: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'accountAgeDays'
    },
    numDiffPtSources: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numDiffPtSources'
    },
    lastPointSource: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'lastPointSource'
    },
    numTimesSharedOnFacebook: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numTimesSharedOnFacebook'
    },
    totalPointsGiven: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'totalPointsGiven'
    },
    numDiffPtTargets: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numDiffPtTargets'
    },
    numDiffPtTargetsInSameDep: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numDiffPtTargetsInSameDep'
    },
    numDiffPtTargetsInDiffDep: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numDiffPtTargetsInDiffDep'
    },
    numPtsGivenInSameDep: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numPtsGivenInSameDep'
    },
    numPtsGivenInDiffDep: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numPtsGivenInDiffDep'
    },
    numDiffPtSourcesInSameDep: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numDiffPtSourcesInSameDep'
    },
    numDiffPtSourcesInDiffDep: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numDiffPtSourcesInDiffDep'
    },
    numDiffDepPtTargets: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numDiffDepPtTargets'
    },
    numDiffDepPtSources: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numDiffDepPtSources'
    },
    numTimesPageXViewed: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numTimesPageXViewed'
    },
    numTimesButtonXClicked: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numTimesButtonXClicked'
    },
    numTimesButtonXHovered: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numTimesButtonXHovered'
    },
    totalTimeSpentOnPageX: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'totalTimeSpentOnPageX'
    },
    numTimesClickedInApp: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numTimesClickedInApp'
    },
    numTimesProfileEdited: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numTimesProfileEdited'
    },
    numTimesProfilePicChanged: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numTimesProfilePicChanged'
    },
    numJobTitlesHeld: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numJobTitlesHeld'
    },
    numTimesPasswordChanged: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'numTimesPasswordChanged'
    },
    metricscol: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'metricscol'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updatedAt'
    }
  }, {
    tableName: 'metrics'
  });

  const MetricsSession = sequelize.define('metricsSession', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      field: 'id',
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      field: 'user_id',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updatedAt'
    },
    finishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'finishedAt'
    },
    routeActivity: {
      type: DataTypes.BLOB,
      allowNull: true,
      field: 'route_activity'
    },
    windowActivity: {
      type: DataTypes.BLOB,
      allowNull: true,
      field: 'window_activity'
    },
    clickActivity: {
      type: DataTypes.BLOB,
      allowNull: true,
      field: 'click_activity'
    },
  }, {
    tableName: 'metrics_session'
  });

  MetricsSession.belongsTo(User, {foreignKey: 'userId', targetKey: 'id'});
  User.hasMany(MetricsSession, {foreignKey: 'userId', sourceKey: 'id'});

  // store_item table
  const StoreItem = sequelize.define('storeItem', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      field: 'id',
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'name'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'description'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updatedAt'
    },
    cost: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      field: 'cost'
    },
    imagePath: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'image_path',
      defaultValue: 'store/placeholder.jpg'
    }
  }, {
    tableName: 'store_item'
  });

  // user_has_notification
  const UserHasNotification = sequelize.define('userHasNotification', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
      field: 'id'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updatedAt'
    },
    username: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'username'
    },
    notificationId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      field: 'notification_id'
    }
  }, {
    tableName: 'user_has_notification'
  });

  UserHasNotification.belongsTo(User, {foreignKey: 'username', targetKey: 'username'});
  UserHasNotification.belongsTo(Notification, {foreignKey: 'notificationId', targetKey: 'id'});
  User.hasMany(UserHasNotification, {foreignKey: 'username', sourceKey: 'username'});
  Notification.hasMany(UserHasNotification, {foreignKey: 'notificationId', sourceKey: 'id'});

  // user_has_store_item table
  const UserHasStoreItem = sequelize.define('userHasStoreItem', {
    userId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: false,
      references: {
        model: 'user',
        key: 'id'
      },
      field: 'user_id'
    },
    managerId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: false,
      references: {
        model: 'user',
        key: 'id'
      },
      field: 'manager_id'
    },
    storeItemId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: false,
      references: {
        model: 'storeItem',
        key: 'id'
      },
      field: 'store_item_id'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updatedAt'
    },
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
      field: 'id'
    },
    status: {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue: 'pending',
      field: 'status'
    },
    cancelDescription: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'cancel_description'
    }
  }, {
    tableName: 'user_has_store_item'
  });

  UserHasStoreItem.belongsTo(User, {foreignKey: 'userId', targetKey: 'id', as: 'requestUser'});
  UserHasStoreItem.belongsTo(User, {foreignKey: 'managerId', targetKey: 'id', as: 'managerUser'});
  UserHasStoreItem.belongsTo(StoreItem, {foreignKey: 'storeItemId', targetKey: 'id'});
  User.hasMany(UserHasStoreItem, {foreignKey: 'userId', sourceKey: 'id', as: 'requestUser'});
  User.hasMany(UserHasStoreItem, {foreignKey: 'managerId', sourceKey: 'id', as: 'managerUser'});
  StoreItem.hasMany(UserHasStoreItem, {foreignKey: 'storeItemId', sourceKey: 'id'});

  // achievement_has_role_audience table
  const AchievementHasRoleAudience = sequelize.define('achievementHasRoleAudience', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    achievementId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      field: 'achievement_id'
    },
    roleId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      field: 'role_id'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updatedAt'
    },
  }, {
    tableName: 'achievement_has_role_audience',
    freezeTableName: true
  });

  Achievement.hasMany(AchievementHasRoleAudience, {foreignKey: 'achievementId', sourceKey: 'id'});
  SecurityRole.hasMany(AchievementHasRoleAudience, {foreignKey: 'roleId', sourceKey: 'id'});

  // feature table
  const Feature = sequelize.define('feature', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      field: 'id',
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'name'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'description'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updatedAt'
    },
  }, {
    tableName: 'feature'
  });

  // achievement_unlocks_feature table
  const AchievementUnlocksFeature = sequelize.define('achievementUnlocksFeature', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    achievementId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      field: 'achievement_id'
    },
    featureId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      field: 'feature_id'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updatedAt'
    },
  }, {
    tableName: 'achievement_unlocks_feature',
  });

  Achievement.hasOne(AchievementUnlocksFeature, {foreignKey: 'achievementId', sourceKey: 'id'});
  AchievementUnlocksFeature.belongsTo(Achievement, {foreignKey: 'achievementId', targetKey: 'id'});
  Feature.hasOne(AchievementUnlocksFeature, {foreignKey: 'featureId', sourceKey: 'id'});
  AchievementUnlocksFeature.belongsTo(Feature, {foreignKey: 'featureId', targetKey: 'id'});


  return {
    Achievement: Achievement,
    AchievementTransaction: AchievementTransaction,
    Department: Department,
    LikeInfo: LikeInfo,
    Metrics: Metrics,
    Notification: Notification,
    PointItem: PointItem,
    PointPool: PointPool,
    PointTransaction: PointTransaction,
    SecurityRole: SecurityRole,
    StoreItem: StoreItem,
    User: User,
    UserAchievementProgress: UserAchievementProgress,
    UserHasNotification: UserHasNotification,
    UserHasStoreItem: UserHasStoreItem,
    AchievementHasRoleAudience: AchievementHasRoleAudience,
    Feature: Feature,
    AchievementUnlocksFeature: AchievementUnlocksFeature
  };
};
