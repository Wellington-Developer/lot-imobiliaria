// Styles
import { FormFilter } from '../FormFilter';
import { Posts } from './Posts';
import './style.css'

export const Home = () => {
  return (
    <div>
      <FormFilter />
      <div id="posts">
      </div>
    <div className="homepage-section__container container" id="posts">
      <Posts type={'Locação'}/>
    </div>

    </div>
  )
};