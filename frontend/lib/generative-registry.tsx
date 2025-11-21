"use client";

import React from "react";
import { z } from "zod";

/**
 * Component registration interface for Tambo-style generative UI components
 */
export interface GenerativeComponentRegistration<T = any> {
  name: string;
  description: string;
  component: React.ComponentType<T>;
  propsSchema?: z.ZodSchema<T>;
}

/**
 * Component payload structure expected in chat messages
 */
export interface ComponentPayload {
  component: {
    componentName: string;
    props: Record<string, any>;
  };
}

/**
 * Extra props that can be passed to components during rendering
 */
export interface ExtraProps {
  onInsert?: (content: string) => void;
  [key: string]: any;
}

// In-memory component registry
const componentRegistry = new Map<
  string,
  GenerativeComponentRegistration<any>
>();

/**
 * Register a generative component
 */
export function registerGenerativeComponent<T = any>(
  registration: GenerativeComponentRegistration<T>
): void {
  if (componentRegistry.has(registration.name)) {
    console.warn(
      `Component "${registration.name}" is already registered. Overwriting.`
    );
  }
  componentRegistry.set(registration.name, registration);
}

/**
 * Unregister a generative component
 */
export function unregisterGenerativeComponent(name: string): void {
  componentRegistry.delete(name);
}

/**
 * Get a registered component
 */
export function getGenerativeComponent(
  name: string
): GenerativeComponentRegistration<any> | undefined {
  return componentRegistry.get(name);
}

/**
 * Validate component props against schema if available
 */
export function validateComponentProps<T>(
  registration: GenerativeComponentRegistration<T>,
  props: any
): { valid: boolean; props: T; error?: z.ZodError } {
  if (!registration.propsSchema) {
    return { valid: true, props: props as T };
  }

  const result = registration.propsSchema.safeParse(props);
  if (result.success) {
    return { valid: true, props: result.data };
  } else {
    return { valid: false, props: props as T, error: result.error };
  }
}

/**
 * Render a component from a message payload
 */
export function renderTamboComponentFromMessage(
  payload: ComponentPayload,
  extraProps?: ExtraProps
): React.ReactElement | null {
  const { componentName, props } = payload.component;
  const registration = getGenerativeComponent(componentName);

  if (!registration) {
    console.warn(`Component "${componentName}" is not registered.`);
    return null;
  }

  // Validate props if schema is available
  const validation = validateComponentProps(registration, props);
  if (!validation.valid) {
    console.error(
      `Invalid props for component "${componentName}":`,
      validation.error?.errors
    );
    // Still render with invalid props, but log the error
  }

  const Component = registration.component;
  const mergedProps = { ...validation.props, ...extraProps };

  return React.createElement(Component, mergedProps);
}

/**
 * Check if a string contains a valid component payload
 */
export function extractComponentPayload(
  text: string
): ComponentPayload | null {
  // Try to find JSON blocks in the text
  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/g;
  const matches = Array.from(text.matchAll(jsonBlockRegex));

  for (const match of matches) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed?.component?.componentName) {
        return parsed as ComponentPayload;
      }
    } catch (e) {
      // Continue to next match
    }
  }

  // Also try to parse the entire text as JSON
  try {
    const parsed = JSON.parse(text.trim());
    if (parsed?.component?.componentName) {
      return parsed as ComponentPayload;
    }
  } catch (e) {
    // Not valid JSON
  }

  return null;
}

/**
 * Streaming update helper - merges partial updates into a component payload
 */
export function mergeStreamingUpdate(
  current: ComponentPayload | null,
  update: Partial<ComponentPayload>
): ComponentPayload {
  if (!current) {
    // Create a new payload from the update
    return {
      component: {
        componentName: update.component?.componentName || "",
        props: update.component?.props || {},
      },
    };
  }

  return {
    component: {
      componentName:
        update.component?.componentName || current.component.componentName,
      props: {
        ...current.component.props,
        ...update.component?.props,
      },
    },
  };
}

/**
 * Get all registered component names
 */
export function getRegisteredComponentNames(): string[] {
  return Array.from(componentRegistry.keys());
}

