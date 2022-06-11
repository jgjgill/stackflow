import {
  aggregate,
  DispatchEvent,
  DomainEvent,
  makeEvent,
} from "@stackflow/core";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import isEqual from "react-fast-compare";

import { makeActivityId } from "../activity";
import { useContext } from "../context";
import { usePlugins } from "../plugins";
import { Activities } from "../stackflow";
import { CoreActionsContext } from "./CoreActionsContext";
import { CoreStateContext } from "./CoreStateContext";

type PushedEvent = Extract<DomainEvent, { name: "Pushed" }>;

const SECOND = 1000;

// 60FPS
const INTERVAL_MS = SECOND / 60;

export interface CoreProviderProps {
  activities: Activities;
  transitionDuration: number;
  initialActivity?: (args: { context: any }) => string;
  children: React.ReactNode;
}
export const CoreProvider: React.FC<CoreProviderProps> = ({
  transitionDuration,
  initialActivity,
  activities,
  children,
}) => {
  const plugins = usePlugins();
  const context = useContext();

  const initialEvents = useMemo(() => {
    const initialEventDate = new Date().getTime() - transitionDuration;

    const initialPushedEventByPlugin = plugins.reduce<PushedEvent | null>(
      (acc, plugin) => plugin.initialPushedEvent?.() ?? acc,
      null,
    );

    const initialPushedEventByOption = initialActivity
      ? makeEvent("Pushed", {
          activityId: makeActivityId(),
          activityName: initialActivity({ context }),
          params: {},
          eventDate: initialEventDate,
        })
      : null;

    const initialPushedEvent =
      initialPushedEventByPlugin ?? initialPushedEventByOption;

    const activityRegisteredEvents = Object.keys(activities).map(
      (activityName) =>
        makeEvent("ActivityRegistered", {
          activityName,
          eventDate: initialEventDate,
        }),
    );

    const events: DomainEvent[] = [
      makeEvent("Initialized", {
        transitionDuration,
        eventDate: initialEventDate,
      }),
      ...activityRegisteredEvents,
    ];

    if (initialPushedEvent) {
      events.push(initialPushedEvent);
    }

    return events;
  }, []);

  const initialState = useMemo(
    () => aggregate(initialEvents, new Date().getTime()),
    [],
  );

  const [state, setState] = useState(() => initialState);

  const eventsRef = useRef(initialEvents);
  const stateRef = useRef(initialState);
  const getState = useCallback(() => stateRef.current, [stateRef]);

  const dispatchEvent = useCallback<DispatchEvent>(
    (name, parameters) => {
      const newEvent = makeEvent(name, parameters);
      const events = [...eventsRef.current, newEvent];
      eventsRef.current = events;

      setState(aggregate(events, new Date().getTime()));
    },
    [eventsRef, setState],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const events = eventsRef.current;
      const nextState = aggregate(events, new Date().getTime());

      if (!isEqual(state, nextState)) {
        setState(nextState);
        stateRef.current = nextState;
      }

      if (nextState.globalTransitionState === "idle") {
        clearInterval(interval);
      }
    }, INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [eventsRef, state, setState]);

  return (
    <CoreStateContext.Provider value={state}>
      <CoreActionsContext.Provider
        value={useMemo(
          () => ({
            getState,
            dispatchEvent,
          }),
          [getState, dispatchEvent],
        )}
      >
        {children}
      </CoreActionsContext.Provider>
    </CoreStateContext.Provider>
  );
};