import { useParams } from "react-router-dom";

function Activity() {
  const { groupId } = useParams();
  return <div>{groupId}</div>;
}

export default Activity;
