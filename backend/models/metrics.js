/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('metrics', {
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
};
