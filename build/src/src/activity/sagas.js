// DASHBOARD
import { call, put, takeEvery, all } from "redux-saga/effects";
import * as APIcall from "API/crossbarCalls";
import * as t from "./actionTypes";

/***************************** Subroutines ************************************/

// For installer: throttle(ms, pattern, saga, ...args)

export function* getUserActionLogs() {
  try {
    const res = yield call(APIcall.getUserActionLogs);
    // fetchDirectory CALL DOCUMENTATION:
    // > kwargs: {}
    // > result: logs <string>

    // Abort on error
    if (!res) return;

    // Process userActionLogs
    const userActionLogs = res
      .trim()
      .split("\n")
      .map(e => JSON.parse(e));

    // Collapse equal errors
    for (let i = 0; i < userActionLogs.length; i++) {
      const log = userActionLogs[i];
      const logNext = userActionLogs[i + 1];
      if (log && logNext) {
        if (
          log.level === logNext.level &&
          log.event === logNext.event &&
          log.message === logNext.message &&
          log.stack === logNext.stack
        ) {
          log.count ? log.count++ : (log.count = 2);
          userActionLogs.splice(i + 1, 1);
          // Go one step back to keep aggregating on the same index
          i--;
        }
      }
    }

    // Update userActionLogs
    yield put({ type: t.UPDATE_USERACTIONLOGS, userActionLogs });
  } catch (error) {
    console.error("Error fetching userActionLogs: ", error);
  }
}

/******************************************************************************/
/******************************* WATCHERS *************************************/
/******************************************************************************/

function* watchConnectionOpen() {
  yield takeEvery("CONNECTION_OPEN", getUserActionLogs);
}

// notice how we now only export the rootSaga
// single entry point to start all Sagas at once
export default function* root() {
  yield all([watchConnectionOpen()]);
}
