import React from "react";

import Terminal from "./Terminal";
import "./switch.css";

const refreshInterval = 2 * 1000;

export default class DisplayLogs extends React.Component {
  constructor() {
    super();
    this.state = {
      autoRefresh: true,
      timestamps: false,
      search: "",
      lines: 200,
      handle: 0
    };
    this.change = this.change.bind(this);
    this.toggleTimestamps = this.toggleTimestamps.bind(this);
    this.toggleAutoRefresh = this.toggleAutoRefresh.bind(this);
    this.changeLines = this.changeLines.bind(this);
    this.logPackage = this.logPackage.bind(this);
  }

  componentDidMount() {
    this.handle = setInterval(this.logPackage, refreshInterval);
  }

  componentWillUnmount() {
    clearInterval(this.handle);
  }

  logPackage() {
    this.props.logPackage({
      timestamps: this.state.timestamps,
      tail: this.state.lines
    });
  }

  toggleAutoRefresh = e => {
    if (this.state.autoRefresh) {
      // Shuting off auto-refresh
      clearInterval(this.handle);
    } else {
      // Turning on auto-refresh
      this.handle = setInterval(this.logPackage, 1000);
    }
    this.setState({ autoRefresh: !this.state.autoRefresh });
  };

  toggleTimestamps = e => {
    this.setState({ timestamps: !this.state.timestamps });
  };

  change = target => e => {
    this.setState({ [target]: e.target.value });
  };

  changeLines = e => {
    const n = e.target.value;
    if (!isNaN(parseInt(n, 10)) && isFinite(n) && parseInt(n, 10) > 0) {
      this.setState({ lines: parseInt(n, 10) });
    } else {
      console.warn("Attempting to use a wrong number of lines", n);
    }
  };

  render() {
    let logs = this.props.logs || "";
    let logsArray = logs.split(/\r?\n/);
    let logsFiltered = logsArray
      .slice(logsArray.length - this.state.lines)
      .filter(line =>
        line.toLowerCase().includes(this.state.search.toLowerCase())
      )
      .join("\n");

    return (
      <div className="border-bottom mb-4">
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3">
          <h4>Logs</h4>
        </div>
        <div className="card mb-4">
          <div className="card-body">
            <div className="form-group">
              <span className="switch switch-sm">
                <input
                  type="checkbox"
                  className="switch"
                  id="switch-refresh"
                  checked={this.state.autoRefresh}
                  onChange={this.toggleAutoRefresh}
                />
                <label htmlFor="switch-refresh">Auto-refresh logs</label>
              </span>
            </div>
            <div className="form-group">
              <span className="switch switch-sm">
                <input
                  type="checkbox"
                  className="switch"
                  id="switch-ts"
                  checked={this.state.timestamps}
                  onChange={this.toggleTimestamps}
                />
                <label htmlFor="switch-ts">Display timestamps</label>
              </span>
            </div>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">Lines</span>
              </div>
              <input
                type="number"
                className="form-control"
                placeholder="Number of lines to display..."
                value={this.state.lines}
                onChange={this.changeLines}
              />
            </div>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">Search</span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Filter..."
                value={this.state.search}
                onChange={this.change("search")}
              />
            </div>
            <Terminal text={logsFiltered} />
          </div>
        </div>
      </div>
    );
  }
}
