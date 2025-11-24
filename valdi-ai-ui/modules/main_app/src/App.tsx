/**
 * App - Root Component
 *
 * The root component of the Valdi AI UI application.
 * Sets up navigation and renders the main application structure.
 */

import { Component } from 'valdi_core/src/Component';
import { NavigationRoot } from 'valdi_navigation/src/NavigationController';
import { HomePage } from './HomePage';

/**
 * App Component
 *
 * Root component that initializes the navigation system
 * and renders the home page.
 */
export class App extends Component<Record<string, never>> {
  override onRender() {
    return (
      <NavigationRoot>
        {$slot((navigationController) => {
          return <HomePage navigationController={navigationController} />;
        })}
      </NavigationRoot>
    );
  }
}
