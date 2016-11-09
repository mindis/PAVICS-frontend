import React from 'react';
import {ProcessesSelector, ProcessDetails} from './../../components/WorkflowWizard';
import {Panel, Grid, Row, Col} from 'react-bootstrap';
import * as constants from './../../constants';
class WorkflowWizard extends React.Component {
  static propTypes = {
    processes: React.PropTypes.array.isRequired,
    chooseProcess: React.PropTypes.func.isRequired,
    currentStep: React.PropTypes.string.isRequired,
    selectedProcess: React.PropTypes.object.isRequired
  }

  makeSection () {
    switch (this.props.currentStep) {
      case constants.WORKFLOW_STEP_PROCESS:
        return (
          <Panel header="Choose workflow">
            <ProcessesSelector
              processes={this.props.processes}
              chooseProcess={this.props.chooseProcess}
            />
          </Panel>
        );
      case constants.WORKFLOW_STEP_INPUTS:
        return (
          <Grid>
            <Row>
              <Col md={4}>
                <Panel header="Workflow Detail">
                  <ProcessDetails
                    selectedProcess={this.props.selectedProcess}
                  />
                </Panel>
              </Col>
              <Col md={8}>
                <Panel header="Choose Inputs">
                  inputs
                </Panel>
              </Col>
            </Row>
          </Grid>
        );
    }
  }

  render () {
    return (
      <Grid>
        <Row>
          <Col md={8} mdOffset={2}>
            {this.makeSection()}
          </Col>
        </Row>
      </Grid>
    );
  }
}
export default WorkflowWizard;

