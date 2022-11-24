import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface NavigationStateType {
  navigationStack: string[]
  pageBefore: string | null
}

const initialState: NavigationStateType = {
  navigationStack: [],
  pageBefore: null,
}

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    navigationPush(state, action: PayloadAction<string>) {
      if (state.navigationStack.length > 0) {
        state.pageBefore =
          state.navigationStack[state.navigationStack.length - 1]
      }
      state.navigationStack.push(action.payload)
    },
    navigationPop(state) {
      state.navigationStack.pop()

      if (state.navigationStack.length > 1) {
        state.pageBefore =
          state.navigationStack[state.navigationStack.length - 2]
      } else {
        state.pageBefore = null
      }
    },
    navigationClear(state) {
      state.navigationStack = []
      state.pageBefore = null
    },
  },
})

export const { navigationPop, navigationPush, navigationClear } =
  navigationSlice.actions
export default navigationSlice.reducer
