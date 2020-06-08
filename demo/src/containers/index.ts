import { Dispatch } from 'redux';
import { connect } from 'react-redux'

import { Actions } from '../actions'
import App from '../components/App'
import { GlobalState } from '../reducers';

export interface Props {
}

function mapStateToProps(state:GlobalState) {
  return state
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    initialize:    (base_url:string) => {dispatch(Actions.initialize(base_url))}

  }
}

const Connector = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default Connector;
