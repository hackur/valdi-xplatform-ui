/**
 * App - Root Component
 *
 * The root component of the Valdi AI UI application.
 * Sets up navigation and renders the main application structure.
 */

import { Component } from '@valdi/valdi_core';
import { NavigationRoot } from '@valdi/valdi_navigation';
import { HomePage } from './HomePage';

/**
 * App Component
 *
 * Root component that initializes the navigation system
 * and renders the home page.
 */
export class App extends Component<Record<string, never>> {
  onRender() {
    return (
      <NavigationRoot>
        {$slot((navigationController) => {
          return <HomePage navigationController={navigationController} />;
        })}
      </NavigationRoot>
    );
  }
}
