import { ID, guid } from '@datorama/akita';

export type MetricsModel = {
  id: ID;
  userId: number;
  lastLogonDate: any;
  lastLogoffDate: any;
  numLogons: number;
  numLogoffs: number;
  totalPointsReceived: number;
  lastPointTransactionDate: any;
  totalAchievementPointsEarned: number;
  totalAchievementsEarned: number;
  lastPointItemName: string;
  totalLoggedSeconds: number;
  accountAgeDays: number;
  numDiffPtSources: number;
  lastPointSource: string;
  numTimesSharedOnFacebook: number;
  totalPointsGiven: number;
  numDiffPtTargets: number;
  numDiffPtTargetsInSameDep: number;
  numDiffPtTargetsInDiffDep: number;
  numPtsGivenInSameDep: number;
  numPtsGivenInDiffDep: number;
  numDiffPtSourcesInSameDep: number;
  numDiffPtSourcesInDiffDep: number;
  numDiffDepPtTargets: number;
  numDiffDepPtSources: number;
  numTimesPageXViewed: number;
  numTimesButtonXClicked: number;
  numTimesButtonXHovered: number;
  totalTimeSpentOnPageX: number;
  numTimesClickedInApp: number;
  numTimesProfileEdited: number;
  numTimesProfilePicChanged: number;
  numJobTitlesHeld: number;
  numTimesPasswordChanged: number;
  homepageTimerStart: any;
  homepageSeconds: number;
  dateModified: any;

};

export function createMetricsModel({ userId, lastLogonDate, lastLogoffDate, numLogons, numLogoffs, totalPointsReceived,
                                     lastPointTransactionDate, totalAchievementPointsEarned, totalAchievementsEarned, lastPointItemName,
                                     totalLoggedSeconds, accountAgeDays, numDiffPtSources, lastPointSource, numTimesSharedOnFacebook,
                                     totalPointsGiven, numDiffPtTargets, numDiffPtTargetsInSameDep, numDiffPtTargetsInDiffDep,
                                     numPtsGivenInSameDep, numPtsGivenInDiffDep, numDiffPtSourcesInSameDep, numDiffPtSourcesInDiffDep,
                                     numDiffDepPtTargets, numDiffDepPtSources, numTimesPageXViewed, numTimesButtonXClicked,
                                     numTimesButtonXHovered, totalTimeSpentOnPageX, numTimesClickedInApp, numTimesProfileEdited,
                                     numTimesProfilePicChanged, numJobTitlesHeld, numTimesPasswordChanged, homepageTimerStart,
                                     homepageSeconds, }: Partial<MetricsModel>) {

  return {
    id: guid(),
    userId,
    lastLogonDate,
    lastLogoffDate,
    numLogons,
    numLogoffs,
    totalPointsReceived,
    lastPointTransactionDate,
    totalAchievementPointsEarned,
    totalAchievementsEarned,
    lastPointItemName,
    totalLoggedSeconds,
    accountAgeDays,
    numDiffPtSources,
    lastPointSource,
    numTimesSharedOnFacebook,
    totalPointsGiven,
    numDiffPtTargets,
    numDiffPtTargetsInSameDep,
    numDiffPtTargetsInDiffDep,
    numPtsGivenInSameDep,
    numPtsGivenInDiffDep,
    numDiffPtSourcesInSameDep,
    numDiffPtSourcesInDiffDep,
    numDiffDepPtTargets,
    numDiffDepPtSources,
    numTimesPageXViewed,
    numTimesButtonXClicked,
    numTimesButtonXHovered,
    totalTimeSpentOnPageX,
    numTimesClickedInApp,
    numTimesProfileEdited,
    numTimesProfilePicChanged,
    numJobTitlesHeld,
    numTimesPasswordChanged,
    homepageTimerStart,
    homepageSeconds,
    dateModified: Date.now(),
  } as MetricsModel;
}
