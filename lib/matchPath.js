module.exports = (paths, path) => {
    const pathArr = path.split('/')
    let matchingPath
    Object.keys(paths).forEach((currPath) => {
        const currPathArr = currPath.split('/')
        if (pathArr.length == currPathArr.length &&
            currPathArr.every((part, idx) => {
                return ((part == pathArr[idx]) || (part.substr(0, 1) == '{' && part.substr(-1) == '}'))
            })) {
            matchingPath = currPath
        }
    })
    return matchingPath
};
