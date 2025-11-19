/**
 * Main App Component
 * Root component with navigation setup
 */

import { Component } from 'valdi_core/src/Component';
import { NavigationRoot, NavigationController } from 'valdi_navigation/src/NavigationRoot';

import { HomePage } from './HomePage';

/**
 * Main application component
 * Sets up navigation and renders the home page
 */
export class App extends Component {
  private navigationController?: NavigationController;

  onCreate() {
    // Component initialization
  }

  onRender() {
    <NavigationRoot>
      {$slot((navigationController: NavigationController) => {
        // Store navigation controller for future use
        this.navigationController = navigationController;

        // Render initial page
        <HomePage navigationController={navigationController} />;
      })}
    </NavigationRoot>;
  }

  onDestroy() {
    // Cleanup
  }
}
