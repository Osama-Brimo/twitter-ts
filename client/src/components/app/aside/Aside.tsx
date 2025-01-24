import Suggestions from './Suggestions';
import Trends from './Trends';

interface AsideProps {
  data: object;
}

const Aside = ({ data }: AsideProps) => {
  return (
    <div
      className="auto-rows-max items-start gap-4 lg:gap-8 hidden md:grid"
    >
      <div className='sticky top-5 grid gap-4'>
        <Suggestions />
        <Trends />
      </div>
    </div>
  );
};

export default Aside;
