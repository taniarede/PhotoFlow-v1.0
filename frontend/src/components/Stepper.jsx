import React from 'react';
import { STEPS } from '../constants';

/**
 * Presentational progress stepper. `doneMap` and `warningMap` are derived
 * from live flow state in App.jsx — this component holds no state of its own.
 */
export default function Stepper({ doneMap, warningMap = {}, activeId }) {
  return (
    <nav className="stepper" aria-label="PhotoFlow progress">
      <ol className="stepper-list">
        {STEPS.map((step, index) => {
          const done = Boolean(doneMap[step.id]);
          const warning = Boolean(warningMap[step.id]) && !done;
          const active = step.id === activeId;
          const className = [
            'step',
            done ? 'done' : '',
            warning ? 'warning' : '',
            active ? 'active' : '',
          ].filter(Boolean).join(' ');
          const stateLabel = done
            ? 'completed'
            : warning
              ? `warning: ${step.id === 'author' ? 'author not entered' : 'watermark disabled'}`
              : 'pending';

          return (
            <li className="stepper-item" key={step.id}>
              <span
                className={className}
                aria-current={active ? 'step' : undefined}
                aria-label={`${step.label}: ${stateLabel}`}
              >
                <span className="dot" aria-hidden="true">
                  {done ? '✓' : warning ? '×' : index + 1}
                </span>
                <span className="step-label">{step.label}</span>
                <span className="sr-only"> — {stateLabel}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
