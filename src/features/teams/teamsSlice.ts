import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface TeamsState {
  selectedTeamId: number | null;
}

const initialState: TeamsState = {
  selectedTeamId: null,
};

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setSelectedTeam: (state, action: PayloadAction<number | null>) => {
      state.selectedTeamId = action.payload;
    },
  },
});

export const { setSelectedTeam } = teamsSlice.actions;

export default teamsSlice.reducer;
